import { InputType, Field } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@InputType()
export class FindUsersInput {
    @Field()
    @IsNumber()
    page: number

    @Field()
    @IsNumber()
    limit: number

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    filter?: string
}