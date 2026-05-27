import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DayOfWeek } from 'src/core/enums/doctor/availability.enums';
import { AvailabilitySession } from './session.schema';

@Schema({ timestamps: true, collection: 'doctor_availabilities' })
export class DoctorAvailabilitySchema {
  @Prop({ type: Types.ObjectId, ref: 'MongoDoctorSchema', required: true })
  doctorId: Types.ObjectId;

  @Prop({
    type: String,
    enum: DayOfWeek,
    required: true,
  })
  dayOfWeek: DayOfWeek;

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean;

  @Prop({
    type: [AvailabilitySession],
    default: [],
  })
  sessions: AvailabilitySession[];

  @Prop({ required: false, min: 10, max: 30 })
  slotDuration: number;

  @Prop({ required: true })
  startDate: string

  @Prop({ 
    type: Date,
    required: false, 
    default: null 
  })
  endDate?: Date | null;

  @Prop({ required: true })
  timezone: string
}

export type DoctorAvailabilityDocument = DoctorAvailabilitySchema & Document;

export const DoctorAvailabilityModel =
  SchemaFactory.createForClass(DoctorAvailabilitySchema);
