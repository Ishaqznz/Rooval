import { Inject, Injectable } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { IPaymentUseCase } from "src/application/use-cases/interface/payment.usecase.interface";
import { CreatePaymentSessionInput } from "../../types/payment/input/paymentSession.input";
import { PaymentSession } from "../../types/payment/model/paymentSession.model";

@Injectable()
@Resolver()
export class PaymentResolver {
    constructor(
        @Inject('IPaymentUseCase')
        private readonly _paymentUseCase: IPaymentUseCase
    ) {}

    @Mutation(() => PaymentSession)
    async createPaymentSession(
        @Args('input') input: CreatePaymentSessionInput
    ): Promise<PaymentSession> {
        return this._paymentUseCase.createPaymentSession(input.appointmentId)
    }
}