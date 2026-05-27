import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CountDoctorsInput {
    @Field()
    @IsString()
    @IsOptional()
    search?: string

    @Field()
    @IsString()
    @IsOptional()
    status?: string
}