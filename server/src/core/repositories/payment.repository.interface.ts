import { WithdrawDoctorMoney } from "../entities/payment/withdrawDoctorMoney.entity"
import { WithdrawUserMoney } from "../entities/payment/withdrawUserMoney.entity"
import { PaymentStatus } from "../enums/appointments/appointment.enums"

export interface IPaymentRepository {
    changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean>
    withdrawUserMoney(entity: WithdrawUserMoney): Promise<boolean>
    withdrawDoctorMoney(entity: WithdrawDoctorMoney): Promise<boolean>
}