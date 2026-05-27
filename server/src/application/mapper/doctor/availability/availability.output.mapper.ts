import { IAvailabilityResponseDTO } from "src/application/dto/availability/response/availability.response.dto";
import { ExtendedAvailability } from "src/core/entities/doctor/availability/extendedAvailability.entity";
import { DayOfWeek } from "src/core/enums/doctor/availability.enums";

export class AvailabilityOutputMapper {
    static toAvailabilitiesDTO(entities: ExtendedAvailability[]): IAvailabilityResponseDTO[] {
        const dtos = entities.map((e) => {
            return {
                id: e.id.value,
                doctorId: e.doctorId.value,
                dayOfWeek: e.dayOfWeek.value as DayOfWeek,
                isAvailable: e.isAvailable,
                sessions: e.sessions.value,
                slotDuration: Number(e.slotDuration.value),
                startDate: e.startDate,
                endDate: e.endDate,
                timezone: e.timezone
            }
        })
        return dtos;
    }
}