import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AppointmentAvailability {
  @Field()
  startTime: Date; 

  @Field()
  endTime: Date;  
}
