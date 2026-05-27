import { IUpsertAvailabilityRequestDTO } from "src/application/dto/availability/request/upsert.request.dto";
import { IAvailabilityUseCase } from "../interface/availability.usecase.interface";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { Inject, Injectable } from "@nestjs/common";
import { IAvailabilityRepository } from "src/core/repositories/availability.repository.interface";
import { AvailabilityInputMapper } from "src/application/mapper/doctor/availability/availability.input.mapper";
import { IGetSlotsRequestDTO } from "src/application/dto/availability/request/slots.request.dto";
import { ISlotResponseDTO } from "src/application/dto/availability/response/slots.response.dto";
import { GetAvailability } from "src/core/entities/doctor/availability/getAvailability.entity";
import { AvailabilityDomainService } from "src/core/services/doctor/availabilityDomain.service";
import { IAvailabilityResponseDTO } from "src/application/dto/availability/response/availability.response.dto";
import { AvailabilityOutputMapper } from "src/application/mapper/doctor/availability/availability.output.mapper";
import { ITimeZoneService } from "src/application/services/timezone.service.interface";
import { IAppointmentRepository } from "src/core/repositories/appointment.repository";
import { AppointmentOverlap } from "src/core/entities/appointment/getAppointment.entity";

@Injectable()
export class AvailabilityUseCase implements IAvailabilityUseCase {
    constructor(
        @Inject('IAvailabilityRepository')
        private readonly _availabilityRepository: IAvailabilityRepository,
        @Inject('IAppointmentRepository')
        private readonly _appointmentRepository: IAppointmentRepository,
        @Inject('ITimeZoneService')
        private readonly _timezoneService: ITimeZoneService
    ) { }

    async upsertAvailability(input: IUpsertAvailabilityRequestDTO[]): Promise<boolean> {
        const entities = AvailabilityInputMapper.toAvailabilityEntities(input)
        if (entities.ok == false) {
            throw new BusinessRuleViolationError(entities.error)
        }
        return this._availabilityRepository.upsert(entities.value)
    }

    async deleteAvailabilities(doctorId: string): Promise<boolean> {
        return await this._availabilityRepository.delete(doctorId)
    }

    async getSlotsBydate(input: IGetSlotsRequestDTO): Promise<ISlotResponseDTO[]> {

        // creating an entity
        const entity = GetAvailability.create(input.doctorId, input.date);
        if (entity.ok == false) throw new BusinessRuleViolationError(entity.error);

        // fetching all the availabilities based on doctorId and day
        const availabilities = await this._availabilityRepository.getByDay(entity.value);

        const pureDate = new Date(input.date).toISOString().split("T")[0];

        const preparedAvailabilities = availabilities.map(a => {
            const convertedSessions = a.sessions.value.map(session => {
                const startUTC = this._timezoneService.toUTC(
                    pureDate,
                    session.startTime,
                    a.timezone
                );

                const endUTC = this._timezoneService.toUTC(
                    pureDate,
                    session.endTime,
                    a.timezone
                );

                return {
                    startTimeUTC: startUTC,
                    endTimeUTC: endUTC
                };
            });

            return {
                ...a,
                sessions: { value: convertedSessions }
            };
        });

        // creating all the slots using domain service
        const slots = AvailabilityDomainService.toSlots(preparedAvailabilities);

        if (slots.length === 0) return []
        const minStart = new Date(Math.min(...slots.map(s => s.startTime.getTime())));
        const maxEnd = new Date(Math.max(...slots.map(s => s.endTime.getTime())));

        // creating an overlapping entity and finding any overlapping exists
        const overlappingEntity = AppointmentOverlap.create(input.doctorId, minStart, maxEnd)
        const appointments = await this._appointmentRepository.findOverLapping(overlappingEntity);
        
        const availableSlots = slots.filter(slot => {
            return !appointments.some(app =>
                AvailabilityDomainService.isOverlapping(slot, { startTime: app.session.startTime, endTime: app.session.endTime })
            );
        });

        return availableSlots;
    }


    async getAvailabilities(doctorIds: string[]): Promise<IAvailabilityResponseDTO[]> {
        const entities = await this._availabilityRepository.getByIds(doctorIds)
        return AvailabilityOutputMapper.toAvailabilitiesDTO(entities)
    }
}