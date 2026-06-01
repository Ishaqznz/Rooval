import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsString, ValidateNested } from "class-validator";
import { DoctorAppointmentType } from "src/core/enums/appointments/appointment.enums";
import { Type } from "class-transformer";
import { AppointmentAvailabilityInput } from "./appointmentAvailability.input";

@InputType()
export class CreateAppointmentInput {
    @Field()
    @IsString()
    doctorId: string

    @Field(() => AppointmentAvailabilityInput)
    @ValidateNested()
    @Type(() => AppointmentAvailabilityInput)
    session: AppointmentAvailabilityInput

    @Field(() => DoctorAppointmentType)
    @IsEnum(DoctorAppointmentType)
    appointmentType: DoctorAppointmentType

    @Field()
    @IsNumber()
    amount: number

    @Field()
    @IsNumber()
    slotDuration: number

    @Field()
    @IsNumber()
    bufferTime: number
}