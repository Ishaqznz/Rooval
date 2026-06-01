import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums";
import { AppointmentType } from "src/core/enums/user/profile.enum";

export class ListAppointments {
    constructor(
        public readonly input: {
            doctorId: string,
            page: number,
            limit: number,
            search?: string,
            appointmentType?: AppointmentType,
            appointmentStatus?: AppointmentStatus
        }
    ) { }

    static create(
        input: {
            doctorId: string,
            page: number,
            limit: number,
            search?: string,
            appointmentType?: AppointmentType,
            appointmentStatus?: AppointmentStatus
        }
    ): ListAppointments {
        return new ListAppointments(input)
    }
}
