export class GetBalance {
    constructor(
        public readonly input: {
            ownerId: string;
        }
    ) { }

    static create(input: {
        ownerId: string
    }): GetBalance {
        return new GetBalance(input)
    }
}