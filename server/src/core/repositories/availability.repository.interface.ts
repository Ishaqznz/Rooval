import { GetAvailability } from "../entities/doctor/availability/getAvailability.entity";
import { ExtendedAvailability } from "../entities/doctor/availability/extendedAvailability.entity";
import { Availability } from "../entities/doctor/availability/upsertAvailability.entity";

export interface IAvailabilityRepository {
    upsert(entities: Availability[]): Promise<boolean>
    delete(doctorId: string): Promise<boolean>
    getByDay(entity: GetAvailability): Promise<Availability[]>
    getByIds(doctorIds: string[]): Promise<ExtendedAvailability[]>
    getTimezone(doctorId: string): Promise<string>
}