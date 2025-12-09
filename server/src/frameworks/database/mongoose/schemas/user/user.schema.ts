import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class MongoUserSchema {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  isBlocked: boolean

  @Prop({ default: false })
  isAdmin: boolean

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  googleId: string
}

export type UserDocument = MongoUserSchema & Document;
export const UserSchema = SchemaFactory.createForClass(MongoUserSchema);
