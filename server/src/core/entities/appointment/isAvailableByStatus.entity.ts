import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";

export class IsAvailableByStatus {
    constructor(
        public readonly input: IAppointmentAvailabilitySession
    ) {}

    static create(input: IAppointmentAvailabilitySession) {
        return new IsAvailableByStatus(input)
    }
} 