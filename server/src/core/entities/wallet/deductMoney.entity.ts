export class DeductMoney {
    constructor(
        public readonly input: {
            walletId: string;
            amount: number;
            description?: string;
            referenceId?: string;
        }
    ) { }

    static create(input: {
        walletId: string;
        amount: number;
        description?: string;
        referenceId?: string;
    }): DeductMoney {
        return new DeductMoney(input)
    }
}