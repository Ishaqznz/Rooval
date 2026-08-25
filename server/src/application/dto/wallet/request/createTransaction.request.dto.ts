import { WalletTransactionReason, WalletTransactionType } from "../../../../core/enums/wallet/wallet.enum"

export interface ICreateTransactionRequestDTO {
    walletId: string
    type: WalletTransactionType
    amount: number
    reason: WalletTransactionReason
}