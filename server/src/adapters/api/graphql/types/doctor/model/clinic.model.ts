import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Clinic {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  workingDays?: string;
}