import { Args, Context, Mutation, Resolver, Query } from "@nestjs/graphql";
import { Injectable, UseGuards } from "@nestjs/common";
import { GqlContext } from "src/common/types/gql-context.type";
import { UpsertDoctorAvailabilityInput } from "../../types/availability/input/upsertAvailability.input";
import { Inject } from "@nestjs/common";
import { IAvailabilityUseCase } from "src/application/use-cases/interface/availability.usecase.interface";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { SlotInput } from "../../types/doctor/input/slot.input";
import { Slot } from "../../types/doctor/model/slot.model";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { LoggerService } from "@nestjs/common";

@Injectable()
@Resolver(() => DoctorAvailabilityResolver)
export class DoctorAvailabilityResolver {
    constructor(
        @Inject('IAvailabilityUseCase')
        private readonly _availabilityUseCase: IAvailabilityUseCase,
        @Inject(WINSTON_MODULE_PROVIDER) 
        private readonly _logger: LoggerService,
    ) { }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async upsertDoctorAvailability(
        @Context() context: GqlContext,
        @Args('input', { type: () => [UpsertDoctorAvailabilityInput] })
        input: UpsertDoctorAvailabilityInput[]
    ): Promise<boolean> {
        const doctorId = context.req.user.userId;
        const entrichedInput = input.map((item) => ({
            doctorId,
            ...item
        }))
        return await this._availabilityUseCase.upsertAvailability(entrichedInput)
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async deleteDoctorAvailabilities(
        @Context() context: GqlContext
    ): Promise<boolean> {
        const doctorId = context.req.user.userId;
        return await this._availabilityUseCase.deleteAvailabilities(doctorId)
    }

    @Query(() => [Slot])
    async getDoctorSlotsByDate(
        @Args('input') input: SlotInput
    ): Promise<Slot[]> {
        console.log('the input in the production getDoctorSlotsByDate method: ', input)
        const slots = await this._availabilityUseCase.getSlotsBydate(input)
        return slots
    }
}