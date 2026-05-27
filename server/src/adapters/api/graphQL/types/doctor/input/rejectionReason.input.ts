import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RejectionReasonInput {
  @Field()
  @IsString()
  doctorId: string

  @Field()
  @IsString()
  rejectionReason: string
}
