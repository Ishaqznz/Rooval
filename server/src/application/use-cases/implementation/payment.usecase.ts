import { Inject, Injectable } from "@nestjs/common";
import { IPaymentUseCase } from "../interface/payment.usecase.interface";
import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";
import { IPaymentService } from "src/application/services/payment.service.interface";
import { IAppointmentUseCase } from "../interface/appointment.usecase.interface";
import { IWebHookService } from "src/application/services/webhook.service.interface";
import { IPaymentRepository } from "src/core/repositories/payment.repository.interface";
import { PaymentStatus } from "src/core/enums/appointments/appointment.enums";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { AppointmentErrorType } from "src/core/enums/appointments/appointment.enums";
import { IDoctorUseCase } from "../interface/doctor.usecase.interface";
import { IWalletUseCase } from "../interface/wallet.usecase.interface";
import { WalletTransactionReason, WalletTransactionType } from "src/core/enums/wallet/wallet.enum";
import { forwardRef } from "@nestjs/common";
import { IWithdrawUserMoneyRequestDTO } from "src/application/dto/payment/request/withdrawUserMoney.request.dto";
import { WithdrawUserMoney } from "src/core/entities/payment/withdrawUserMoney.entity";
import { WithdrawDoctorMoney } from "src/core/entities/payment/withdrawDoctorMoney.entity";
import { IWithdrawDoctorMoneyRequestDTO } from "src/application/dto/payment/request/withdrawDoctorMoney.request.dto";

@Injectable()
export class PaymentUseCase implements IPaymentUseCase {
    constructor(
        @Inject('IPaymentService')
        private readonly _paymentService: IPaymentService,

        @Inject('IWebHookService')
        private readonly _webhookService: IWebHookService,

        @Inject(forwardRef(() => 'IAppointmentUseCase'))
        private readonly _appointmentUseCase: IAppointmentUseCase,

        @Inject('IPaymentRepository')
        private readonly _paymentRepository: IPaymentRepository,

        @Inject('IDoctorUseCase')
        private readonly _doctorUseCase: IDoctorUseCase,

        @Inject('IWalletUseCase')
        private readonly _walletUseCase: IWalletUseCase
    ) { }

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
            const wallet = await this._walletUseCase.getWallet({
                ownerId: appointment.patientId
            })

            await this.changePaymentStatus(appointmentId, PaymentStatus.PAID)
            await this._appointmentUseCase.deleteUnpaidSessionAppointments(appointment.session)
            await this._doctorUseCase.grantChatAccess({
                userId: appointment.patientId,
                doctorId: appointment.doctorId
            })

            await this._walletUseCase.createTransaction({
                amount: appointment.amount,
                reason: WalletTransactionReason.APPOINTMENT_PAYMENT,
                type: WalletTransactionType.DEBIT,
                walletId: wallet.id
            })

            const doctorWallet = await this._walletUseCase.getWallet({ ownerId: appointment.doctorId })
            await this._walletUseCase.addMoney({ walletId: doctorWallet.id, amount: appointment.amount })
            await this._walletUseCase.createTransaction({ 
                walletId: doctorWallet.id,
                amount: appointment.amount,
                reason: WalletTransactionReason.APPOINTMENT_PAYMENT,
                type: WalletTransactionType.CREDIT
            })
        }
        return true;
    }

    async changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean> {
        return this._paymentRepository.changePaymentStatus(appointmentId, status)
    }

    async withdrawUserMoney(input: IWithdrawUserMoneyRequestDTO): Promise<boolean> {
        const entity = WithdrawUserMoney.create(input)

        const wallet = await this._walletUseCase.getWallet({ ownerId: entity.input.userId })
        await this._walletUseCase.deductMoney({ amount: entity.input.amount, walletId: wallet.id }) 
        await this._walletUseCase.createTransaction({ 
            walletId: wallet.id, 
            amount: entity.input.amount, 
            reason: WalletTransactionReason.WITHDRAWAL, 
            type: WalletTransactionType.DEBIT 
        })

        return this._paymentRepository.withdrawUserMoney(entity)
    }

    async withdrawDoctorMoney(input: IWithdrawDoctorMoneyRequestDTO): Promise<boolean> {
        const entity = WithdrawDoctorMoney.create(input)
        
        const wallet = await this._walletUseCase.getWallet({ ownerId: entity.input.doctorId })
        await this._walletUseCase.deductMoney({ amount: entity.input.amount, walletId: wallet.id })
        await this._walletUseCase.createTransaction({
            amount: entity.input.amount,
            reason: WalletTransactionReason.WITHDRAWAL,
            type: WalletTransactionType.DEBIT,
            walletId: wallet.id
        })

        return this._paymentRepository.withdrawDoctorMoney(entity)
    }
}