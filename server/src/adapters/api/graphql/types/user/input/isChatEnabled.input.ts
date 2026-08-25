import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class IsChatEnabledInput {
    @Field()
    @IsString()
    doctorId: string
}