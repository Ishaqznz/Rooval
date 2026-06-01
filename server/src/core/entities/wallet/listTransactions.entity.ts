import { Transaction } from "./transaction.entity";

export class ListTransactions {
    constructor(
        public readonly input: {
            transactions: Transaction[]
            totalTransactions: number
        }
    ) { }

    static create(input: {
        transactions: Transaction[]
        totalTransactions: number
    }): ListTransactions {
        return new ListTransactions(input)
    }
}