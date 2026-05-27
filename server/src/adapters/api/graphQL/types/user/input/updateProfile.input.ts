import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Gender } from 'src/core/enums/user/profile.enum';

@InputType()
export class UpdateUserProfileInput {

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => Gender, { nullable: true })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender

  @Field({ nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  allergies?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  currentMedication?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}
