import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Profile } from './profile.schema';
import { ProfileSchema } from './profile.schema';

@Schema({ timestamps: true, collection: 'users' })
export class MongoUserSchema {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({
    type: ProfileSchema,
    default: () => ({})
  })
  profile: Profile;


  @Prop({ required: false })
  googleId: string;

  @Prop({ required: false })
  password: string;
}

export type UserDocument = MongoUserSchema & Document;
export const UserSchema = SchemaFactory.createForClass(MongoUserSchema);