import { Inject, Injectable } from "@nestjs/common";
import { IPaymentUseCase } from "../interface/payment.usecase.interface";
import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";
import { IPaymentService } from "src/application/services/payment.service.interface";
import { IAppointmentUseCase } from "../interface/appointment.usecase.interface";
import { IWebHookService } from "src/application/services/webhook.service.interface";
import { IPaymentRepository } from "src/core/repositories/payment.repository.interface";
import { PaymentStatus } from "src/core/enums/user/appointment.enums";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { AppointmentErrorType } from "src/core/enums/appointments/appointment.enums";
import { IDoctorUseCase } from "../interface/doctor.usecase.interface";

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
        private readonly _paymentRepository: IPaymentRepository,

        @Inject('IDoctorUseCase')
        private readonly _doctorUseCase: IDoctorUseCase
    ) {}

    async createPaymentSession(appointmentId: string): Promise<ICreateCheckoutSessionResponse> {
        const appointment = await this._appointmentUseCase.findById(appointmentId)
        if (!appointment) throw new BusinessRuleViolationError(AppointmentErrorType.APPOINTMENT_NOT_FOUND)
        const isAvailable = await this._appointmentUseCase.isAvailableByStatus(appointment.session)
        if (isAvailable) {
            await this._appointmentUseCase.deleteUnpaidSessionAppointments(appointment.session)
            throw new BusinessRuleViolationError(AppointmentErrorType.APPOINTMENT_NOT_AVAILABLE)
        }
        const paymentSession = await this._paymentService.createCheckoutSession(appointment)
        return paymentSession;
    }

    async handlePaymentEvent(payload: Buffer, signature: string): Promise<boolean> {
        const appointmentId = await this._webhookService.handleStripeEvent(payload, signature)
        const appointment = await this._appointmentUseCase.findById(appointmentId);
        if (appointmentId) {
            await this._paymentRepository.changePaymentStatus(appointmentId, PaymentStatus.PAID)
            await this._appointmentUseCase.deleteUnpaidSessionAppointments(appointment.session)
            await this._doctorUseCase.grantChatAccess({
                userId: appointment.patientId,
                doctorId: appointment.doctorId
            })
        }
        return true;
    }
}