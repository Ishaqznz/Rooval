export const GET_WALLET = (fields: string) => ({
    query: `
        query getWallet {
            getWallet {
                ${ fields }
            }
        }
    `
})

export const LIST_TRANSACTIONS = (fields: string) => ({
    query: `
        query listTransactions($input: GetTransactionsInput!) {
            listTransactions(input: $input) {
                ${ fields }
            }
        }
    `
})