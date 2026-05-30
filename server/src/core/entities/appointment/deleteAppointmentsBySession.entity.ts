import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";

export class DeleteAppointmentsBySession {
    constructor (
        public readonly input: IAppointmentAvailabilitySession
    ) {}

    static create(input: IAppointmentAvailabilitySession) {
        return new DeleteAppointmentsBySession(input)
    }
}