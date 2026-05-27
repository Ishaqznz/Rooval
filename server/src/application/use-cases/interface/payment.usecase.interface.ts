import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";

export interface IPaymentUseCase {
    createPaymentSession(appointmentId: string): Promise<ICreateCheckoutSessionResponse>
    handlePaymentEvent(payload: Buffer, signature: string): Promise<boolean>
}