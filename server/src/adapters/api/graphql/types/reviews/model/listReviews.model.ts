import { Field, ObjectType } from "@nestjs/graphql";
import { Review } from "./review.model";

@ObjectType()
export class ListReviews {
    @Field(() => Review)
    reviews: Review[]

    totalReviews: number
}