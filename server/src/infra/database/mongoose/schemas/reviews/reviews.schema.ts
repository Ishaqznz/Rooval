import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = MongoReviewSchema & Document;

@Schema({
  timestamps: true,
  collection: 'reviews',
})

export class MongoReviewSchema {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Doctor',
    index: true,
  })
  doctorId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  })
  patientId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Appointment',
    unique: true,
  })
  appointmentId: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  })
  review: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isVisible: boolean;
}

export const ReviewSchema =
  SchemaFactory.createForClass(MongoReviewSchema);

ReviewSchema.index({ doctorId: 1 });
ReviewSchema.index({ patientId: 1 });
ReviewSchema.index({ doctorId: 1, patientId: 1 });