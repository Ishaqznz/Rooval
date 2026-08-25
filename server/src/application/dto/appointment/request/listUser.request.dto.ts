import { AppointmentStatus } from "../../../../core/enums/appointments/appointment.enums"
import { AppointmentType } from "../../../../core/enums/user/profile.enum"

export interface IListUserAppointmentsRequestDTO {
    userId: string
    page: number
    limit: number
    search?: string
    appointmentType?: AppointmentType
    appointmentStatus?: AppointmentStatus
}