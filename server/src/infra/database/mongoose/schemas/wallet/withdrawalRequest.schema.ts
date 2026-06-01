import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/core/enums/user/role.enum';
import { WithdrawalStatus } from 'src/core/enums/payment/payment.enums';

export type WithdrawalRequestDocument =
    MongoWithdrawalRequestSchema & Document;

@Schema({
    timestamps: true,
    collection: 'withdrawalRequests',
})
export class MongoWithdrawalRequestSchema {
    @Prop({
        type: Types.ObjectId,
        required: true,
        index: true,
    })
    ownerId: Types.ObjectId;

    @Prop({
        type: String,
        enum: Role,
        required: true,
    })
    ownerType: Role;

    @Prop({
        type: Number,
        required: true,
        min: 1,
    })
    amount: number;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    accountHolderName: string;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    accountNumber: string;

    @Prop({
        type: String,
        required: true,
        trim: true,
    })
    bankName: string;

    @Prop({
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    })
    ifscCode: string;

    @Prop({
        type: String,
        default: '',
    })
    notes?: string;

    @Prop({
        type: String,
        enum: WithdrawalStatus,
        default: WithdrawalStatus.PENDING,
        index: true,
    })
    status: WithdrawalStatus;
}

export const WithdrawalRequestSchema =
    SchemaFactory.createForClass(
        MongoWithdrawalRequestSchema,
    );