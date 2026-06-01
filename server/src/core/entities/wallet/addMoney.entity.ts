export class AddMoney {
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
    }): AddMoney {
        return new AddMoney(input)
    }
}