import { apiRequest } from "@/api";
import { GET_WALLET, LIST_TRANSACTIONS } from "@/graphql/queries/wallet"

export enum ListTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ALL = 'ALL'
}

export const walletApiService = {
    getWallet: async (fields: string) => {
        const queryObj = GET_WALLET(fields);
        return apiRequest({ ...queryObj });
    },

    listTransactions: async (variables: { input: {
        walletId: string,
        type: ListTransactionType,
        page: number,
        limit: number
    }}, fields: string) => {
        const queryObj = LIST_TRANSACTIONS(fields)
        return apiRequest({ ...queryObj, variables })
    }
}