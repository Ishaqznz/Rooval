import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums";
import { AppointmentType } from "src/core/enums/user/profile.enum";

export class ListAllAppointments {
    constructor(
        public readonly input: {
            page: number,
            limit: number,
            search?: string,
            appointmentType?: AppointmentType,
            appointmentStatus?: AppointmentStatus
        }
    ) { }

    static create(
        input: {
            page: number,
            limit: number,
            search?: string,
            appointmentType?: AppointmentType,
            appointmentStatus?: AppointmentStatus
        }
    ): ListAllAppointments {
        return new ListAllAppointments(input)
    }
}
