import { Field, InputType } from "@nestjs/graphql";
import { IsDate } from "class-validator";

@InputType()
export class AppointmentAvailabilityInput {
    @Field()
    @IsDate()
    startTime: Date

    @Field()
    @IsDate()
    endTime: Date
}
