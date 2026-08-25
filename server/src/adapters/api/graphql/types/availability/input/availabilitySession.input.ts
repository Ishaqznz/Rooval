import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class AvailabilitySessionInput {
    @Field()
    @IsString()
    startTime: string

    @Field()
    @IsString()
    endTime: string
}
