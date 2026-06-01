import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";
import { IWithdrawUserMoneyRequestDTO } from "src/application/dto/payment/request/withdrawUserMoney.request.dto";
import { IWithdrawDoctorMoneyRequestDTO } from "src/application/dto/payment/request/withdrawDoctorMoney.request.dto";
import { PaymentStatus } from "src/core/enums/appointments/appointment.enums";

export interface IPaymentUseCase {
    createPaymentSession(appointmentId: string): Promise<ICreateCheckoutSessionResponse>
    handlePaymentEvent(payload: Buffer, signature: string): Promise<boolean>
    changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean>
    withdrawUserMoney(input: IWithdrawUserMoneyRequestDTO): Promise<boolean>
    withdrawDoctorMoney(input: IWithdrawDoctorMoneyRequestDTO): Promise<boolean>
}