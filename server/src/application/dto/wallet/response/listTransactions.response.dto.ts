import { ITransactionResponseDTO } from "./transaction.response.dto";

export interface IListTransactionsResponseDTO {
    transactions: ITransactionResponseDTO[]
    totalTransactions: number
}