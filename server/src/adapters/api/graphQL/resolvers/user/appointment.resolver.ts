import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Query, Context } from "@nestjs/graphql";
import { GqlContext } from "src/common/types/gql-context.type";
import { CreateAppointmentInput } from "../../types/appointment/input/createAppointment.input";
import { IAppointmentUseCase } from "src/application/use-cases/interface/appointment.usecase.interface";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { Appointment } from "../../types/appointment/model/appointment.model";
import { CancelAppointmentInput } from "../../types/appointment/input/cancelAppointment.input";
import { Doctor } from "../../types/doctor/model/doctor.model";
import { ListAppointmentsInput } from "../../types/appointment/input/listAppointments.input";
import { ListAppointments } from "../../types/appointment/model/listAppointment.model";
import { User } from "../../types/user/model/user.model";
import { CancelAppointmentByDoctorInput } from "../../types/appointment/input/cancelAppointmentByDoctor.input";
import { JwtAdminGuard } from "src/common/guards/admin.guard";
import { ListAllAppointmentsInput } from "../../types/appointment/input/listAllAppointments.input";

@Injectable()
@Resolver(() => Appointment)
export class DoctorAppointmentResolver {
    constructor(
        @Inject('IAppointmentUseCase')
        private readonly _appointmentUseCase: IAppointmentUseCase
    ) { }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async createAppointment(
        @Context() context: GqlContext,
        @Args('input') input: CreateAppointmentInput
    ): Promise<string> {
        const userId = context.req.user.userId
        return this._appointmentUseCase.createAppointment({ ...input, userId })
    }

    @Query(() => [Appointment])
    @UseGuards(JwtAuthGuard)
    async findUserAppointments(
        @Context() context: GqlContext
    ): Promise<Appointment[]> {
        const userId = context.req.user.userId
        return this._appointmentUseCase.findUserAppointments(userId)
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async cancelAppointment(
        @Args('input') input: CancelAppointmentInput
    ): Promise<boolean> {
        return this._appointmentUseCase.cancelAppointment(input)
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async cancelAppointmentByDoctor(
        @Args('input') input: CancelAppointmentByDoctorInput
    ): Promise<boolean> {
        return this._appointmentUseCase.cancelAppointmentByDoctor(input)
    }

    @ResolveField(() => Doctor)
    @UseGuards(JwtAuthGuard)
    async doctor(
        @Parent() appointment: Appointment,
        @Context() context: GqlContext
    ): Promise<Doctor> {
        return await context.loaders.doctor.load(appointment.doctorId);
    }

    @ResolveField(() => User, { nullable: true })
    @UseGuards(JwtAuthGuard)
    async user(
        @Parent() appointment: Appointment,
        @Context() context: GqlContext
    ): Promise<User | null> {
        return await context.loaders.user.load(appointment.patientId)
    }

    @Query(() => ListAppointments)
    @UseGuards(JwtAuthGuard)
    async listAppointments(
        @Args('input') input: ListAppointmentsInput,
        @Context() context: GqlContext
    ): Promise<ListAppointments> {
        const doctorId = context.req.user.userId
        return this._appointmentUseCase.listAppointments({ doctorId, ...input })
    }

    @Query(() => ListAppointments)
    @UseGuards(JwtAuthGuard)
    async listUserAppointments(
        @Args('input') input: ListAppointmentsInput,
        @Context() context: GqlContext
    ): Promise<ListAppointments> {
        const userId = context.req.user.userId
        return await this._appointmentUseCase.listUserAppointments({ userId, ...input })
    }


    @Query(() => ListAppointments)
    @UseGuards(JwtAdminGuard)
    async listAllAppointments(
        @Args('input') input: ListAllAppointmentsInput,
    ): Promise<ListAppointments> {
        return this._appointmentUseCase.listAllAppointments(input)
    }
}