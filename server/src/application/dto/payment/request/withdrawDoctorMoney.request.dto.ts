
export interface IWithdrawDoctorMoneyRequestDTO {
    doctorId: string
    amount: number
    accountHolderName: string
    accountNumber: number
    bankName: string
    ifscCode: string
    notes?: string
}