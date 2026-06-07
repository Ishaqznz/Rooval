import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RatingOverview {
  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;
}