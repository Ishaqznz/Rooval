import { InputType, Field } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ConsultationType } from "src/core/enums/doctor/doctor.enums";

@InputType()
export class ConsulationSettingsInput {
    @Field(() => ConsultationType, { nullable: true })
    @IsOptional()
    @IsEnum(ConsultationType)
    type?: ConsultationType

    @Field({ nullable: true })
    @IsNumber()
    @IsOptional()
    inPersonFee?: number

    @Field({ nullable: true })
    @IsNumber()
    @IsOptional()
    videoFee?: number

    @Field({ nullable: true })
    @IsNumber()
    @IsOptional()
    duration?: number

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    sessionBufferTime?: string

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    cancellationPolicy?: string
}