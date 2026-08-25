import { Field, InputType } from "@nestjs/graphql";
import { WalletTransactionReason, WalletTransactionType } from "../../../../../../core/enums/wallet/wallet.enum";

@InputType() 
export class CreateTransactionInput {
    @Field()
    walletId: string;

    @Field(() => WalletTransactionType)
    type: WalletTransactionType;

    @Field()
    amount: number;

    @Field(() => WalletTransactionReason)
    reason: WalletTransactionReason;
}