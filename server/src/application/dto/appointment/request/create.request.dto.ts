import { DoctorAppointmentType } from "../../../../core/enums/appointments/appointment.enums";
import { IAppointmentAvailabilitySession } from "../../../../core/interfaces/doctor/availabilitySessions.interface"

export interface ICreateAppointmentRequestDTO {
    userId: string;
    doctorId: string
    session: IAppointmentAvailabilitySession
    appointmentType: DoctorAppointmentType
    amount: number
    slotDuration: number
    bufferTime: number
}