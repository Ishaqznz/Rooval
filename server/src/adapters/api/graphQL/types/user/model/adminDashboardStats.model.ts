import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AdminDashboardStats {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalDoctors: number;

  @Field(() => Int)
  approvedDoctors: number;

  @Field(() => Int)
  pendingDoctors: number;

  @Field(() => Int)
  rejectedDoctors: number;

  @Field(() => Int)
  totalAppointments: number;

  @Field(() => Int)
  completedAppointments: number;

  @Field(() => Int)
  cancelledAppointments: number;
}