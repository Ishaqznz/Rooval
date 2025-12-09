import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DoctorStatus = 'rejected' | 'approved' | 'pending';

@Schema({ timestamps: true, collection: 'doctors' })
export class MongoDoctorSchema {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: ['rejected', 'approved', 'pending'],
    default: 'pending'
  })
  status: DoctorStatus

  @Prop({ type: Object, default: {} })
  onboarding: Record<string, any>; 

  @Prop({ type: String })
  profilePhoto: string

  @Prop({ type: [String], default: [] })
  certificates: string[]

  @Prop({ required: false })
  googleId: string
}

export type DoctorDocument = MongoDoctorSchema & Document;
export const DoctorSchema = SchemaFactory.createForClass(MongoDoctorSchema)