import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class TokenInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  token: string;
}
