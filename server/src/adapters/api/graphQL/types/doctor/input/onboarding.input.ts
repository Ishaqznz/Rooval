import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { DoctorSpecialization } from "src/core/enums/doctor/profile.enums";
import { ConsultationType } from "src/core/enums/doctor/doctor.enums";

@InputType()
export class DoctorOnboardingInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  gender: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  registrationNumber: string;

  @Field()
  @IsString()
  country: string;

  @Field()
  @IsString()
  state: string;

  @Field()
  @IsNumber()
  experience: number;

  @Field()
  @IsString()
  bio: string;

  @Field(() => [DoctorSpecialization], { nullable: 'itemsAndList' })
  @IsEnum(DoctorSpecialization, { each: true })
  @IsArray()
  specializations: DoctorSpecialization[];

  @Field(() => [ConsultationType]) 
  @IsArray()
  @IsEnum(ConsultationType, { each: true })
  consultationModes: ConsultationType[];

  @Field()
  @IsNumber()
  consultationFee: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @Field()
  @IsNumber()
  consultationDuration: number;

  @Field(() => ConsultationType) 
  @IsEnum(ConsultationType)
  preferredMode: ConsultationType;

  @Field({ defaultValue: true })
  @IsBoolean()
  acceptingPatients: boolean;

  @Field({ defaultValue: true })
  @IsBoolean()
  profileVisibility: boolean;
}
