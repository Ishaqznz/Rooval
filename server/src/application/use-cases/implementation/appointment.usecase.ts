import { ICreateAppointmentRequestDTO } from "src/application/dto/appointment/request/create.request.dto";
import { IAppointmentUseCase } from "../interface/appointment.usecase.interface";
import { Inject, Injectable } from "@nestjs/common";
import { IAppointmentRepository } from "src/core/repositories/appointment.repository";
import { AppointmentInputMapper } from "src/application/mapper/appointment/appointment.input.mapper";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { AppointmentOutputMapper } from "src/application/mapper/appointment/appointment.output.mapper";
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto";
import { UserErrorType } from "src/core/enums/user/user.enums";
import { AppointmentOverlap } from "src/core/entities/appointment/getAppointment.entity";
import { ICancelAppointmentRequestDTO } from "src/application/dto/appointment/request/cancel.request.dto";
import { CancelAppointment } from "src/core/entities/appointment/cancelAppointment.entity";
import { IListAppointmentsRequestDTO } from "src/application/dto/appointment/request/list.request.dto";
import { IListAppointmentsResponseDTO } from "src/application/dto/appointment/response/list.response.dto";
import { ListAppointments } from "src/core/entities/appointment/listAppointment.entity";
import { ICancelAppointmentByDoctorRequestDTO } from "src/application/dto/appointment/request/cancelByDoctor.request.dto";
import { CancelAppointmentByDoctor } from "src/core/entities/appointment/cancelAppointmentByDoctor.entity";
import { INotificationOrchestrator } from "src/application/orchestrators/interface/notification.orch.interface";
import { NotificationMessages, NotificationType } from "src/core/enums/notifications/notification.enum";
import { IListAllAppointmentsRequestDTO } from "src/application/dto/appointment/request/listAll.request.dto";
import { ListAllAppointments } from "src/core/entities/appointment/listAllAppointment.entity";
import { IListUserAppointmentsRequestDTO } from "src/application/dto/appointment/request/listUser.request.dto";
import { ListUserAppointments } from "src/core/entities/appointment/listUserAppointments.entity";
import { AppointmentErrorType } from "src/core/enums/appointments/appointment.enums";
import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { DeleteAppointmentsBySession } from "src/core/entities/appointment/deleteAppointmentsBySession.entity";
import { IsAvailableByStatus } from "src/core/entities/appointment/isAvailableByStatus.entity";
import { AppointmentDomainService } from "src/core/services/appointment/appointmentDomainService";

@Injectable()
export class AppointmentUseCase implements IAppointmentUseCase {
    constructor(
        @Inject('IAppointmentRepository')
        private readonly _appointmentRepository: IAppointmentRepository,

        @Inject('INotificationOrchestrator')
        private readonly _notificationOrchestrator: INotificationOrchestrator
    ) { }

    async findById(appointmentId: string): Promise<IAppointmentResponseDTO> {
        const entity = await this._appointmentRepository.findById(appointmentId)
        const dto = AppointmentOutputMapper.toAppoitmentDto(entity)
        if (dto.ok == false) {
            throw new BusinessRuleViolationError(dto.error)
        }
        return dto.value;
    }

    async createAppointment(input: ICreateAppointmentRequestDTO): Promise<string> {
        if (input.userId == input.doctorId) {
            throw new BusinessRuleViolationError(AppointmentErrorType.DOCTOR_NOT_ALLOWED_FOR_THIS_OPERATION);
        }

        let appointmentNumber: number;
        let exists = true;
        while (exists) {
            appointmentNumber = AppointmentDomainService.createAppointmentNo();
            exists = await this._appointmentRepository
                .existsByAppointmentNo(appointmentNumber);
        }

        const entity = AppointmentInputMapper.toAppointmentEntity(input, appointmentNumber);

        if (entity.ok == false) {
            throw new BusinessRuleViolationError(entity.error);
        }

        const newStart = entity.value.session.startTime;
        const newEnd = entity.value.session.endTime;

        const overLappingEntity = AppointmentOverlap.create(entity.value.doctorId, newStart, newEnd)
        const existing = await this._appointmentRepository.findOverLapping(overLappingEntity);

        if (existing.length > 0) {
            throw new BusinessRuleViolationError(AppointmentErrorType.SLOT_ALREADY_BOOKED);
        }

        const appointment = await this._appointmentRepository.create(entity.value);
        if (!appointment) throw new BusinessRuleViolationError(UserErrorType.SYSTEM_ERROR)

        await this._notificationOrchestrator.notify({
            content: NotificationMessages.NEW_APPOINTMENT_CREATED,
            receiverId: input.doctorId,
            isRead: false,
            type: NotificationType.APPOINTMENT
        })
        return appointment;
    }

    async findUserAppointments(userId: string): Promise<IAppointmentResponseDTO[]> {
        const entities = await this._appointmentRepository.findUserAppointments(userId)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)
        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }
        return appointments.value
    }

    async cancelAppointment(input: ICancelAppointmentRequestDTO): Promise<boolean> {
        const entity = CancelAppointment.create(input.appointmentId, input.reason)
        const cancelAppointment = await this._appointmentRepository.cancelAppointment(entity)
        if (!cancelAppointment) throw new BusinessRuleViolationError(UserErrorType.SYSTEM_ERROR)
        return cancelAppointment
    }

    async cancelAppointmentByDoctor(input: ICancelAppointmentByDoctorRequestDTO): Promise<boolean> {
        const entity = CancelAppointmentByDoctor.create(input)
        return await this._appointmentRepository.cancelAppointmentByDoctor(entity)
    }

    async getUserAppointments(userIds: string[]): Promise<IAppointmentResponseDTO[]> {
        const entities = await this._appointmentRepository.getByUserIds(userIds)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)
        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }
        return appointments.value
    }

    async getDoctorAppointments(doctorIds: string[]): Promise<IAppointmentResponseDTO[]> {
        const entities = await this._appointmentRepository.getByDoctorIds(doctorIds)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)
        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }
        return appointments.value
    }

    async listAppointments(input: IListAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO> {
        const entity = ListAppointments.create(input)
        const entities = await this._appointmentRepository.listAppointments(entity)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)

        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }

        const totalCount = await this._appointmentRepository.countByDoctorId(input.doctorId)
        return { appointments: appointments.value, appointmentsCount: totalCount }
    }

    async listUserAppointments(input: IListUserAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO> {
        const entity = ListUserAppointments.create(input)
        const entities = await this._appointmentRepository.listUserAppointments(entity)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)

        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }

        const totalCount = await this._appointmentRepository.countByUserId(input.userId)
        return { appointments: appointments.value, appointmentsCount: totalCount }
    }

    async listAllAppointments(input: IListAllAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO> {
        const entity = ListAllAppointments.create(input)
        const entities = await this._appointmentRepository.listAllAppointments(entity)
        const appointments = AppointmentOutputMapper.toAppointmentDtos(entities)

        if (appointments.ok == false) {
            throw new BusinessRuleViolationError(appointments.error)
        }

        const totalCount = await this._appointmentRepository.countAll()
        return { appointments: appointments.value, appointmentsCount: totalCount }
    }

    async deleteUnpaidSessionAppointments(input: IAppointmentAvailabilitySession): Promise<boolean> {
        const entity = DeleteAppointmentsBySession.create(input)
        return await this._appointmentRepository.deleteUnpaidSessionAppointments(entity)
    }

    async isAvailableByStatus(input: IAppointmentAvailabilitySession): Promise<boolean> {
        const entity = IsAvailableByStatus.create(input)
        return await this._appointmentRepository.isAvailableByStatus(entity)
    }
}