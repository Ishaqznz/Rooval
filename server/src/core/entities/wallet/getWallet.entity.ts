export class GetWallet {
    constructor(
        public readonly input: {
            ownerId: string;
        }
    ) { }

    static create(input: {
        ownerId: string;
    }): GetWallet {
        return new GetWallet(input)
    }
}