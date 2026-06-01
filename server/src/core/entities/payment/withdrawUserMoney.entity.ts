export class WithdrawUserMoney {
    constructor(
        public readonly input: {
            userId: string
            amount: number
            accountHolderName: string
            accountNumber: number
            bankName: string
            ifscCode: string
            notes?: string
        }
    ) { }

    static create(input: {
        userId: string
        amount: number
        accountHolderName: string
        accountNumber: number
        bankName: string
        ifscCode: string
        notes?: string
    }): WithdrawUserMoney {
        return new WithdrawUserMoney(input)
    }
}