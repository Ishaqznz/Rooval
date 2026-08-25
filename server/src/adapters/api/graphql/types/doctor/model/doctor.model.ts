import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DoctorProfile } from './profile.model';
import { DoctorAvailability } from '../../availability/model/availability.model';

@ObjectType()
export class Doctor {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field()
  status: string

  @Field(() => DoctorProfile, { nullable: true })
  profile?: DoctorProfile

  @Field({ nullable: true })
  profilePhoto?: string

  @Field(() => [String], { nullable: true })
  certificates?: string[]

  @Field(() => [DoctorAvailability], { nullable: true })
  availability?: DoctorAvailability[];
}
