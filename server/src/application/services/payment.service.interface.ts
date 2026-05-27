import { IAppointmentResponseDTO } from "../dto/appointment/response/appointment.response.dto"
import { ICreateCheckoutSessionResponse } from "../dto/checkout/request/create.request.dto"

export interface IPaymentService {
    createCheckoutSession(appointment: IAppointmentResponseDTO): Promise<ICreateCheckoutSessionResponse>
}