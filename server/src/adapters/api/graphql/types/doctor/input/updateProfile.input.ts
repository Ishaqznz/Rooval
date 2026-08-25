import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';
import { ClinicInput } from './clinic.input';
import { ConsulationSettingsInput } from './consultationSettings.input';

@InputType()
export class UpdateDoctorProfileInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  registrationNumber?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bio?: string


  @Field(() => ClinicInput, { nullable: true })
  @IsOptional()
  clinic?: ClinicInput

  @Field(() => ConsulationSettingsInput, { nullable: true })
  @IsOptional()
  consultationSettings?: ConsulationSettingsInput
}
