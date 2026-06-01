import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/core/enums/user/role.enum';

export type WalletDocument = MongoWalletSchema & Document;

@Schema({ timestamps: true, collection: 'wallets' })
export class MongoWalletSchema {
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true
  })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Role,
    required: true
  })
  ownerType: Role;

  @Prop({
    type: Number,
    default: 0,
    min: 0
  })
  balance: number;

  @Prop({
    default: 'USD'
  })
  currency: string;

  @Prop({
    default: true
  })
  isActive: boolean;
}

export const WalletSchema =
  SchemaFactory.createForClass(MongoWalletSchema);

WalletSchema.index(
  { ownerId: 1, ownerType: 1 },
  { unique: true }
);