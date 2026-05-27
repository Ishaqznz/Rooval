import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AppointmentStatus, PaymentStatus } from "src/core/enums/user/appointment.enums";
import { AppointmentType } from "src/core/enums/user/profile.enum";
import { AppointmentAvailability } from "./appointmentAvailability.model";

@ObjectType()
export class Appointment {
  @Field(() => ID)
  id: string;

  @Field()
  patientId: string;

  @Field()
  doctorId: string;

  @Field(() => AppointmentAvailability)
  session: AppointmentAvailability;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  @Field(() => AppointmentType)
  type: AppointmentType;

  @Field({ nullable: true })
  reason?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  paymentId?: string;

  @Field({ nullable: true })
  cancelledBy?: string;

  @Field({ nullable: true })
  cancelReason?: string;

  @Field()
  slotDuration: number;

  @Field()
  bufferTime?: number; 

  @Field()
  reminderSent?: boolean;

  @Field()
  isCheckedIn?: boolean;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;
}