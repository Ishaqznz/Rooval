import { InputType, Field, Int, Float } from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ConsultationType } from "src/core/enums/doctor/doctor.enums";

@InputType()
export class DoctorFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  specialization?: string[]

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => ConsultationType, { nullable: true })
  @IsOptional()
  consultationType?: ConsultationType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  minExperience?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minFee?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxFee?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minRating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  availableToday?: boolean;
}
