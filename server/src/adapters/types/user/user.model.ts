import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ defaultValue: false })
  isBlocked: boolean;

  @Field({ defaultValue: false })
  isAdmin: boolean;
}
