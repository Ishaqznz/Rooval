import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CountUsersInput {
    @Field()
    @IsString()
    @IsOptional()
    search?: string

    @Field()
    @IsString()
    @IsOptional()
    status?: string
}