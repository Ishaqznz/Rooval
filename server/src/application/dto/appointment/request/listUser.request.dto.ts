import { AppointmentStatus } from "src/core/enums/user/appointment.enums"
import { AppointmentType } from "src/core/enums/user/profile.enum"

export interface IListUserAppointmentsRequestDTO {
    userId: string
    page: number
    limit: number
    search?: string
    appointmentType?: AppointmentType
    appointmentStatus?: AppointmentStatus
}