import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DoctorOnboarding {
  @Field()
  username: string;

  @Field()
  gender: string;

  @Field()
  phone: string;

  @Field()
  registrationNumber: string;

  @Field()
  country: string;

  @Field()
  state: string;

  @Field()
  experience: string;

  @Field()
  bio: string;

  @Field(() => [String])
  specializations: string[];

  @Field(() => [String])
  consultationModes: string[];

  @Field()
  consultationFee: string;

  @Field(() => [String])
  languages: string[];

  @Field()
  consultationDuration: string;

  @Field()
  preferredMode: string;

  @Field()
  acceptingPatients: boolean;

  @Field()
  profileVisibility: boolean;

  @Field({ nullable: true })
  rejectionReason?: string
}
