import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class FindUserByIdInput {
    @Field()
    @IsString()
    userId: string
}