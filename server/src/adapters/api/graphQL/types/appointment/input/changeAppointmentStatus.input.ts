import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { AppointmentStatus } from "src/core/enums/appointments/appointment.enums";

@InputType()
export class ChangeAppointmentStatusInput {
    @Field()
    @IsString()
    appointmentId: string

    @Field(() => AppointmentStatus)
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus
}
