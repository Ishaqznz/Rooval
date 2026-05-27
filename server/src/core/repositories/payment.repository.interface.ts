import { PaymentStatus } from "../enums/user/appointment.enums"

export interface IPaymentRepository {
    changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean>
}