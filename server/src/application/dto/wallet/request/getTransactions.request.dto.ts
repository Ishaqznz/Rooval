import { ListTransactionType } from "../../../../core/enums/wallet/wallet.enum";

export interface IGetTransactionsRequestDTO {
    walletId: string;
    type: ListTransactionType
    page: number;
    limit: number;
}