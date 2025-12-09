import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsBoolean, IsString } from "class-validator";

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
  @IsString()
  experience: string;

  @Field()
  @IsString()
  bio: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  consultationModes: string[];

  @Field()
  @IsString()
  consultationFee: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @Field()
  @IsString()
  consultationDuration: string;

  @Field()
  @IsString()
  preferredMode: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  acceptingPatients: boolean;

  @Field({ defaultValue: true })
  @IsBoolean()
  profileVisibility: boolean;
}
