import { ListTransactionType } from "src/core/enums/wallet/wallet.enum";

export class GetTransactions {
    constructor(
        public readonly input: {
            walletId: string;
            type: ListTransactionType
            page: number;
            limit: number;
        }
    ) { }

    static create(input: {
        walletId: string;
        type: ListTransactionType
        page: number;
        limit: number;
    }): GetTransactions {
        return new GetTransactions(input)
    }
}