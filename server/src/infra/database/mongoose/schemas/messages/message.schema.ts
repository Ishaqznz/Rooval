import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type MessageDocument = MongoMessageSchema & Document;
import { MessageStatus } from 'src/core/interfaces/chat/chat.interfaces';

@Schema({ timestamps: true, collection: 'messages' })
export class MongoMessageSchema {

  @Prop({ type: Types.ObjectId, ref: 'conversations', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'document'],
    default: 'text'
  })
  type: 'text' | 'image' | 'document';

  @Prop()
  fileUrl?: string;

  @Prop()
  fileName?: string;

  @Prop()
  mimeType?: string

  @Prop({
    type: String,
    enum: MessageStatus,
    default: MessageStatus.SENT
  })
  status: MessageStatus;
}

export const MessageSchema = SchemaFactory.createForClass(MongoMessageSchema);