import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AvailabilitySession {
  @Prop({ required: true })
  startTime: string; 

  @Prop({ required: true })
  endTime: string;   
}