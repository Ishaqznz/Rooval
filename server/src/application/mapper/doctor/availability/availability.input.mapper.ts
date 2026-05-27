import { IUpsertAvailabilityRequestDTO } from "src/application/dto/availability/request/upsert.request.dto";
import { Availability } from "src/core/entities/doctor/availability/upsertAvailability.entity";

export class AvailabilityInputMapper {

    static toAvailabilityEntities(
        input: IUpsertAvailabilityRequestDTO[]
    ): { ok: true; value: Availability[] } | { ok: false; error: string } {

        const entities: Availability[] = []

        for (const item of input) {
            const entity = Availability.create(
                item.doctorId,
                item.dayOfWeek,
                item.sessions,
                item.slotDuration,
                item.startDate,
                item.timezone,
                item.endDate,
            )

            if (entity.ok == false) {
                return { ok: false, error: entity.error }
            }

            entities.push(entity.value)
        }

        return { ok: true, value: entities }
    }

}