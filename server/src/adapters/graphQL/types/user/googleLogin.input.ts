import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class GoogleLoginInput {
  @Field()
  @IsString()
  fullName: string
  
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  googleId: string

  @Field()
  @IsString()
  role: string
}
