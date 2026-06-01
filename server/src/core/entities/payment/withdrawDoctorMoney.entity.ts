export class WithdrawDoctorMoney {
    constructor(
        public readonly input: {
            doctorId: string
            amount: number
            accountHolderName: string
            accountNumber: number
            bankName: string
            ifscCode: string
            notes?: string
        }
    ) { }

    static create(input: {
        doctorId: string
        amount: number
        accountHolderName: string
        accountNumber: number
        bankName: string
        ifscCode: string
        notes?: string
    }): WithdrawDoctorMoney {
        return new WithdrawDoctorMoney(input)
    }
}