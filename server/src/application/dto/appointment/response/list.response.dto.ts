import { IAppointmentResponseDTO } from "./appointment.response.dto"

export interface IListAppointmentsResponseDTO {
    appointments: IAppointmentResponseDTO[]
    appointmentsCount: number
}