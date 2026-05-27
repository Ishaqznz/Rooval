import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Personal {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  experience?: number;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String], { nullable: true })
  specializations?: string[];

  @Field(() => [String], { nullable: true })
  languages?: string[];

  @Field({ nullable: true })
  registrationNumber?: string;

  @Field({ nullable: true })
  preferredMode?: string;

  @Field({ nullable: true })
  profileVisibility?: boolean;
}