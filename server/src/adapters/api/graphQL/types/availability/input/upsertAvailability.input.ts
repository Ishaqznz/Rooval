import { InputType } from "@nestjs/graphql";
import { Field } from "@nestjs/graphql";
import { IsString, IsEnum, IsOptional } from "class-validator";
import { DayOfWeek } from "src/core/enums/doctor/availability.enums";
import { AvailabilitySessionInput } from "./availabilitySession.input";

@InputType()
export class UpsertDoctorAvailabilityInput {
    @Field()
    @IsString()
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek

    @Field(() => [AvailabilitySessionInput])
    sessions: AvailabilitySessionInput[]

    @Field()
    @IsString()
    slotDuration: string

    @Field()
    @IsString()
    startDate: string

    @Field()
    @IsString()
    @IsOptional()
    endDate?: string

    @Field()
    @IsString()
    timezone: string
}