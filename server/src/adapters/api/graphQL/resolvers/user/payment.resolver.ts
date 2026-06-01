import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { Args, Context, GqlArgumentsHost, Mutation, Resolver } from "@nestjs/graphql";
import { IPaymentUseCase } from "src/application/use-cases/interface/payment.usecase.interface";
import { CreatePaymentSessionInput } from "../../types/payment/input/paymentSession.input";
import { PaymentSession } from "../../types/payment/model/paymentSession.model";
import { WithdrawUserMoneyInput } from "../../types/payment/input/withdrawUserMoney.input";
import { WithdrawDoctorMoneyInput } from "../../types/payment/input/withdrawDoctorMoney.input";
import { GqlContext } from "src/common/types/gql-context.type";
import { JwtAuthGuard } from "src/common/guards/auth.guard";

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

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async withdrawUserMoney(
        @Context() context: GqlContext,
        @Args('input') input: WithdrawUserMoneyInput
    ): Promise<boolean> {
        const userId = context.req.user.userId
        return this._paymentUseCase.withdrawUserMoney({ userId, ...input })
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async withdrawDoctorMoney(
        @Context() context: GqlContext,
        @Args('input') input: WithdrawDoctorMoneyInput
    ): Promise<boolean> {
        const doctorId = context.req.user.userId
        return this._paymentUseCase.withdrawDoctorMoney({ doctorId, ...input })
    }
}