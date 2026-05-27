import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Appointment } from "./appointment.model";

@ObjectType()
export class ListAppointments {
    @Field(() => [Appointment])
    appointments: Appointment[]

    @Field(() => Int)
    appointmentsCount: number
}