import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageType } from 'src/core/enums/conversations/conversation.enum';
import { Role } from 'src/core/enums/user/role.enum';
export type ConversationDocument = MongoConversationSchema & Document;

@Schema({ timestamps: true, collection: 'conversations' })
export class MongoConversationSchema {
  @Prop({
    type: [
      {
        userId: {
          type: Types.ObjectId,
          ref: 'users',
          required: true
        },

        role: {
          type: String,
          enum: Role,
          required: true
        }
      }
    ],
    required: true
  })
  participants: {
    userId: Types.ObjectId;
    role: Role;
  }[];

  @Prop({ required: true })
  lastMessage: string;

  @Prop({
    type: String,
    enum: MessageType,
    default: MessageType.TEXT
  })
  lastMessageType: MessageType;

  @Prop({ required: true })
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(MongoConversationSchema);