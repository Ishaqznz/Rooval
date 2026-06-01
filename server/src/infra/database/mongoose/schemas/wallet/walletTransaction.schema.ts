import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WalletTransactionType } from 'src/core/enums/wallet/wallet.enum';
import { WalletTransactionReason } from 'src/core/enums/wallet/wallet.enum';

export type WalletTransactionDocument =
  MongoWalletTransactionSchema & Document;

@Schema({ timestamps: true, collection: 'wallet_transactions' })
export class MongoWalletTransactionSchema {

  @Prop({
    type: Types.ObjectId,
    ref: 'wallets',
    required: true,
    index: true
  })
  walletId: Types.ObjectId;

  @Prop({
    type: String,
    enum: WalletTransactionType,
    required: true
  })
  type: WalletTransactionType;

  @Prop({
    type: Number,
    required: true,
    min: 0
  })
  amount: number;

  @Prop({
    type: String,
    enum: WalletTransactionReason,
    required: true
  })
  reason: WalletTransactionReason;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(MongoWalletTransactionSchema);