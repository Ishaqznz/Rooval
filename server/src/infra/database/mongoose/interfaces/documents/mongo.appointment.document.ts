import { AppointmentStatus, DoctorAppointmentType, PaymentStatus } from "src/core/enums/appointments/appointment.enums"
import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface"

export interface IMongoAppointmentDocument {
    _id: string
    patientId: string
    doctorId: string
    session: IAppointmentAvailabilitySession
    status: AppointmentStatus
    type: DoctorAppointmentType
    appointmentNo: number
    reason?: string
    notes?: string
    paymentStatus: PaymentStatus
    amount?: number
    paymentId?: string
    cancelledBy?: string
    cancelReason?: string
    slotDuration: number
    bufferTime?: number
    reminderSent?: boolean
    isCheckedIn?: boolean
    hasReviewed?: boolean
    createdAt?: Date
    updatedAt?: Date
}