import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AvailabilitySession {
  @Field()
  startTime: string; 

  @Field()
  endTime: string;  
}
