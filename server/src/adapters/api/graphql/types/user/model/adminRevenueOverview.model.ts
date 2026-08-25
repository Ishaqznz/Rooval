import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AdminRevenueOverview {
  @Field(() => Float)
  todayRevenue: number;

  @Field(() => Float)
  monthlyRevenue: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  doctorPayouts: number;

  @Field(() => Float)
  platformProfit: number;
}