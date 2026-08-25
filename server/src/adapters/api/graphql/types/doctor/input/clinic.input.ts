import { InputType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";


@InputType()
export class ClinicInput {
    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    name?: string

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    address?: string

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    phoneNumber?: string

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    country?: string

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    workingDays?: string
}