import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class ChangePasswordInput {
    @Field()
    @IsString()
    oldPassword: string

    @Field()
    @IsString()
    newPassword: string
}