export class GetMessage {
    constructor(
        public readonly input: {
            conversationId: string
        }
    ) { }

    static create(input: {
        conversationId: string
    }): GetMessage {
        return new GetMessage(input)
    }
} 