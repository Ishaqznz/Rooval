import { Inject, Injectable } from "@nestjs/common";
import { IPaymentUseCase } from "../interface/payment.usecase.interface";
import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";
import { IPaymentService } from "src/application/services/payment.service.interface";
import { IAppointmentUseCase } from "../interface/appointment.usecase.interface";
import { IWebHookService } from "src/application/services/webhook.service.interface";
import { IPaymentRepository } from "src/core/repositories/payment.repository.interface";
import { PaymentStatus } from "src/core/enums/user/appointment.enums";

@Injectable()
export class PaymentUseCase implements IPaymentUseCase {
    constructor(
        @Inject('IPaymentService') 
        private readonly _paymentService: IPaymentService,
        @Inject('IWebHookService')
        private readonly _webhookService: IWebHookService,
        @Inject('IAppointmentUseCase')
        private readonly _appointmentUseCase: IAppointmentUseCase,
        @Inject('IPaymentRepository')
        private readonly _paymentRepository: IPaymentRepository
    ) {}

    async createPaymentSession(appointmentId: string): Promise<ICreateCheckoutSessionResponse> {
        const appointment = await this._appointmentUseCase.findById(appointmentId)
        const paymentSession = await this._paymentService.createCheckoutSession(appointment)
        return paymentSession;
    }

    async handlePaymentEvent(payload: Buffer, signature: string): Promise<boolean> {
        const appointmentId = await this._webhookService.handleStripeEvent(payload, signature)
        if (appointmentId) {
            return await this._paymentRepository.changePaymentStatus(appointmentId, PaymentStatus.PAID)
        }
    }
}