import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsString } from 'class-validator';

@InputType()
export class SignUpInput {
  @Field()
  @MinLength(3)
  fullName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  role: string;

  @Field()
  @MinLength(6)
  password: string;
}
