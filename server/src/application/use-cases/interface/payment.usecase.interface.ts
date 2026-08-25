import { ICreateCheckoutSessionResponse } from "../../dto/checkout/request/create.request.dto";
import { IWithdrawUserMoneyRequestDTO } from "../../dto/payment/request/withdrawUserMoney.request.dto";
import { IWithdrawDoctorMoneyRequestDTO } from "../../dto/payment/request/withdrawDoctorMoney.request.dto";
import { PaymentStatus } from "../../../core/enums/appointments/appointment.enums";

export interface IPaymentUseCase {
    createPaymentSession(appointmentId: string): Promise<ICreateCheckoutSessionResponse>
    handlePaymentEvent(payload: Buffer, signature: string): Promise<boolean>
    changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean>
    withdrawUserMoney(input: IWithdrawUserMoneyRequestDTO): Promise<boolean>
    withdrawDoctorMoney(input: IWithdrawDoctorMoneyRequestDTO): Promise<boolean>
}