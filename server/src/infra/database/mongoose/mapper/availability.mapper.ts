import { Availability } from "src/core/entities/doctor/availability/upsertAvailability.entity";
import { IMongoAvailabilityDocument } from "../interfaces/documents/mongo.availability.document";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { ExtendedAvailability } from "src/core/entities/doctor/availability/extendedAvailability.entity";

export class AvailabilityMapper {
    static toAvailabilityEntities(
        input: IMongoAvailabilityDocument[]
    ): Availability[] {

        const entities: Availability[] = [];

        for (const item of input) {
            const result = Availability.create(
                item.doctorId.toString(), 
                item.dayOfWeek,
                item.sessions,
                (item.slotDuration).toString(),
                item.startDate,
                item.timezone,
                item.endDate,
            );

            if (result.ok == false) {
                throw new BusinessRuleViolationError(result.error);
            }

            entities.push(result.value);
        }

        return entities;
    }

    static toExtendedAvailabilityEntities(input: IMongoAvailabilityDocument[]): ExtendedAvailability[] {
        const entities: ExtendedAvailability[] = []
        for (const item of input) {
            const result = ExtendedAvailability.create(
                item._id.toString(),
                item.doctorId.toString(),
                item.dayOfWeek,
                item.isAvailable,
                item.sessions,
                item.slotDuration.toString(),
                item.startDate,
                item.timezone,
                item.endDate,
            )

            if (result.ok == false) throw new BusinessRuleViolationError(result.error)
            entities.push(result.value);
        }
        return entities;
    } 
}