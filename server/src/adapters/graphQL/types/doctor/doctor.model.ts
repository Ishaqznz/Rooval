import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DoctorOnboarding } from './onboarding.model';

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

  @Field(() => DoctorOnboarding, { nullable: true })
  onboarding?: DoctorOnboarding

  @Field({ nullable: true })
  profilePhoto?: string

  @Field(() => [String], { nullable: true })
  certificates?: string[]
}
