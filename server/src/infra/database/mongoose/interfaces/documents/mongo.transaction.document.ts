import { WalletTransactionReason, WalletTransactionType } from "src/core/enums/wallet/wallet.enum";

export interface IMongoTransactionDocument {
    _id: string;
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    reason: WalletTransactionReason;
    createdAt: Date;
    updatedAt: Date;
}