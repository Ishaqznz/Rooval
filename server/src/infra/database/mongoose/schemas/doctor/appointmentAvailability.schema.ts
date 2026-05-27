import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AppointmentAvailability {
  @Prop({ required: true })
  startTime: Date; 

  @Prop({ required: true })
  endTime: Date;   
}