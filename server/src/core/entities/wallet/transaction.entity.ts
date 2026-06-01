import { WalletTransactionReason, WalletTransactionType } from "src/core/enums/wallet/wallet.enum"

export class Transaction {
    constructor(
        public readonly input: {
            id: string
            walletId: string
            type: WalletTransactionType
            amount: number
            reason: WalletTransactionReason
            createdAt: Date
        }
    ) { }

    static create(input: {
        id: string
        walletId: string
        type: WalletTransactionType
        amount: number
        reason: WalletTransactionReason
        createdAt: Date
    }): Transaction {
        return new Transaction(input)
    }
}