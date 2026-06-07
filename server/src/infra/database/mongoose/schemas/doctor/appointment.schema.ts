import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AppointmentStatus } from 'src/core/enums/appointments/appointment.enums';
import { DoctorAppointmentType } from 'src/core/enums/appointments/appointment.enums';
import { PaymentStatus } from 'src/core/enums/appointments/appointment.enums';
import { AppointmentAvailability } from './appointmentAvailability.schema';

@Schema({ timestamps: true, collection: 'appointments' })
export class AppointmentSchema {
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MongoDoctorSchema', required: true })
  doctorId: Types.ObjectId;

  @Prop({ 
    type: AppointmentAvailability,
    required: true 
  })
  session: AppointmentAvailability

  @Prop({
    type: String,
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Prop({
    type: String,
    enum: DoctorAppointmentType,
    required: true,
  })
  type: DoctorAppointmentType;

  @Prop({
    type: Number,
    required: true
  })
  appointmentNo: number

  @Prop({ required: false })
  reason: string;

  @Prop({ required: false })
  notes: string;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: string;

  @Prop({ required: false })
  amount: number;

  @Prop({ required: false })
  paymentId: string;

  @Prop({ required: false })
  cancelledBy: string; 

  @Prop({ required: false })
  cancelReason: string;

  @Prop({ required: true })
  slotDuration: number;

  @Prop({ required: true })
  bufferTime: string

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop({ default: false, required: false })
  hasReviewed: false

  @Prop({ default: false })
  isCheckedIn: boolean;
}

export type AppointmentDocument = AppointmentSchema & Document;

export const AppointmentModel =
  SchemaFactory.createForClass(AppointmentSchema);