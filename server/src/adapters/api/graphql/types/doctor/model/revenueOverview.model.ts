import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RevenueOverview {
  @Field(() => Float)
  availableBalance: number;

  @Field(() => Float)
  todayRevenue: number;

  @Field(() => Float)
  monthlyRevenue: number;

  @Field(() => Float)
  totalRevenue: number;
}