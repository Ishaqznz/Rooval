import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserProfile } from './profile.model';

@ObjectType()
export class User {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  email: string;

  @Field({ defaultValue: false })
  isBlocked: boolean;

  @Field({ defaultValue: false })
  isAdmin: boolean;

  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile
}