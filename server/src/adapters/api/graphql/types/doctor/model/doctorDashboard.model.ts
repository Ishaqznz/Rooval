import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Appointment } from "../../appointment/model/appointment.model";
import { Review } from "../../reviews/model/review.model";
import { DashboardStats } from "./dashboardStats.model";
import { RatingOverview } from "./ratingOverview.model";
import { RevenueOverview } from "./revenueOverview.model";

@ObjectType()
export class DoctorDashboard {
  @Field(() => DashboardStats)
  stats: DashboardStats;

  @Field(() => RatingOverview)
  ratings: RatingOverview;

  @Field(() => RevenueOverview)
  revenue: RevenueOverview;

  @Field(() => [Appointment])
  todayAppointments: Appointment[];

  @Field(() => [Review])
  recentReviews: Review[];
}