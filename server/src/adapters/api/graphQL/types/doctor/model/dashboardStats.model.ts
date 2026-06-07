import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardStats {
  @Field(() => Int)
  totalPatients: number;

  @Field(() => Int)
  totalAppointments: number;

  @Field(() => Int)
  upcomingAppointments: number;

  @Field(() => Int)
  completedAppointments: number;

  @Field(() => Int)
  cancelledAppointments: number;
}