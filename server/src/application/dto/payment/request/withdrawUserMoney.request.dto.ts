
export interface IWithdrawUserMoneyRequestDTO {
    userId: string
    amount: number
    accountHolderName: string
    accountNumber: number
    bankName: string
    ifscCode: string
    notes?: string
}