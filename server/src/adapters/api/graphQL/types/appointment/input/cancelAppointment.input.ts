import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CancelAppointmentInput {
    @Field()
    @IsString()
    appointmentId: string

    @Field()
    @IsString()
    reason: string
}