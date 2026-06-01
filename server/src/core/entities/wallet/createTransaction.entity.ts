import { WalletTransactionType } from "src/core/enums/wallet/wallet.enum"

export class CreateTransaction {
    constructor(
        public readonly input: {
            walletId: string
            type: WalletTransactionType
            amount: number
            reason: string
        }
    ) { }

    static create(input: {
        walletId: string
        type: WalletTransactionType
        amount: number
        reason: string
    }): CreateTransaction {
        return new CreateTransaction(input)
    }
}