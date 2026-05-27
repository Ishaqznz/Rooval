import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from 'src/core/enums/notifications/notification.enum';
export type NotificationDocument = MongoNotificationSchema & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class MongoNotificationSchema {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  receiverId: Types.ObjectId;

  @Prop({
    type: String,
    enum: NotificationType,
    required: true
  })
  type: NotificationType;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(MongoNotificationSchema);