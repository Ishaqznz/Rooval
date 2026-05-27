import { InputType, Field } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ConsultationFilter, DoctorSortField, DoctorSortOrder, DoctorStatusFilter } from "src/core/enums/doctor/doctor.enums";

@InputType()
export class FindDoctorsInput {
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

    @Field(() => DoctorStatusFilter, { nullable: true })
    @IsOptional()
    @IsEnum(DoctorStatusFilter)
    filter?: DoctorStatusFilter

    @Field({ nullable: true })
    @IsOptional()
    specialization?: string

    @Field(() => ConsultationFilter, { nullable: true })
    @IsOptional()
    @IsEnum(ConsultationFilter)
    consultationMode?: ConsultationFilter

    @Field({ nullable: true})
    @IsOptional()
    @IsNumber()
    minExperience?: number

    @Field({ nullable: true })
    @IsOptional()
    @IsNumber()
    maxExperience?: number

    @Field(() => DoctorSortField, { nullable: true })
    @IsOptional()
    @IsEnum(DoctorSortField)
    sortBy: DoctorSortField

    @Field(() => DoctorSortOrder, { nullable: true })
    @IsOptional()
    @IsEnum(DoctorSortOrder)
    sortOrder: DoctorSortOrder
}