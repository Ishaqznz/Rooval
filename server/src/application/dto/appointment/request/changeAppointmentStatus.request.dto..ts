import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums"

export interface IChangeAppointmentStatusDTO {
    appointmentId: string
    status: AppointmentStatus
}