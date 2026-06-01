import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums";
import { AppointmentType } from "src/core/enums/user/profile.enum";

@InputType()
export class ListAppointmentsInput {
    @Field()
    @IsNumber()
    page: number

    @Field()
    @IsNumber()
    limit: number

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    search?: string

    @Field(() => AppointmentType, { nullable : true })
    @IsEnum(AppointmentType)
    @IsOptional()
    appointmentType?: AppointmentType

    @Field(() => AppointmentStatus, { nullable: true })
    @IsEnum(AppointmentStatus)
    @IsOptional()
    appointmentStatus?: AppointmentStatus
}