import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DayOfWeek } from 'src/core/enums/doctor/availability.enums';
import { AvailabilitySession } from './availabilitySession.model';

@ObjectType()
export class DoctorAvailability {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  doctorId: string

  @Field(() => DayOfWeek)
  dayOfWeek: DayOfWeek;

  @Field()
  isAvailable: boolean;

  @Field(() => [AvailabilitySession], { nullable: true })
  sessions?: AvailabilitySession[];

  @Field({ nullable: true })
  slotDuration?: number;

  @Field()
  startDate: string

  @Field({ nullable: true })
  endDate?: string

  @Field()
  timezone: string
}
