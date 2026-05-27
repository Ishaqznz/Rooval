import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString } from "class-validator";

@InputType()
export class ChangeStatusInput {
    @Field()
    @IsString()
    userId: string

    @Field()
    @IsBoolean()
    status: boolean
}