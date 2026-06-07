import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums"

export class ChangeAppointmentStatus {
    constructor(
        public readonly input: {
            appointmentId: string
            status: AppointmentStatus
        }
    ) { }

    static create(
        input: {
            appointmentId: string
            status: AppointmentStatus
        }
    ): ChangeAppointmentStatus {
        return new ChangeAppointmentStatus(input)
    }
}