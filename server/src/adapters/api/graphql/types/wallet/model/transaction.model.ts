import { Field, ID, ObjectType } from "@nestjs/graphql";
import { WalletTransactionReason, WalletTransactionType } from "../../../../../../core/enums/wallet/wallet.enum";

@ObjectType()
export class Transaction {
    @Field(() => ID)
    id: string;

    @Field()
    walletId: string;

    @Field(() => WalletTransactionType)
    type: WalletTransactionType;

    @Field()
    amount: number;

    @Field(() => WalletTransactionReason)
    reason: WalletTransactionReason;

    @Field()
    createdAt: Date;
}