import { AppointmentStatus } from "../../../../core/enums/appointments/appointment.enums"

export interface IChangeAppointmentStatusDTO {
    appointmentId: string
    status: AppointmentStatus
}