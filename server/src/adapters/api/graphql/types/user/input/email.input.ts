import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class EmailInput {
  @IsEmail()
  @Field()
  email: string;
}
