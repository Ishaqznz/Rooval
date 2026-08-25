import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Doctor } from './doctor.model';

@ObjectType()
export class ListDoctors {
  @Field(() => [Doctor])
  doctors: Doctor[];
  
  @Field(() => Int)
  doctorsCount: number
}
