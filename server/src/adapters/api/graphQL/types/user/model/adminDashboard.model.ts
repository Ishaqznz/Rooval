import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AdminDashboardStats } from "./adminDashboardStats.model";
import { AdminRevenueOverview } from "./adminRevenueOverview.model";
import { Appointment } from "../../appointment/model/appointment.model";
import { Doctor } from "../../doctor/model/doctor.model";
import { User } from "./user.model";

@ObjectType()
export class AdminDashboard {
  @Field(() => AdminDashboardStats)
  stats: AdminDashboardStats;

  @Field(() => AdminRevenueOverview)
  revenue: AdminRevenueOverview;

  @Field(() => [Appointment])
  recentAppointments: Appointment[];

  @Field(() => [Doctor])
  recentlyRegisteredDoctors: Doctor[];

  @Field(() => [User])
  recentlyRegisteredUsers: User[];
}