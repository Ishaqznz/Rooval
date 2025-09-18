import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Doctor {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;
}
