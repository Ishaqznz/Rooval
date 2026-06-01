import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums"
import { AppointmentType } from "src/core/enums/user/profile.enum"

export interface IListAllAppointmentsRequestDTO {
    page: number
    limit: number
    search?: string
    appointmentType?: AppointmentType
    appointmentStatus?: AppointmentStatus
}