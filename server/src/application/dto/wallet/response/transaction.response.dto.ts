import { WalletTransactionReason, WalletTransactionType } from "src/core/enums/wallet/wallet.enum";

export interface ITransactionResponseDTO {
    id: string;
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    reason: WalletTransactionReason;
    createdAt: Date;
}