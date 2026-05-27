export class MarkAsRead {
    constructor(
        public readonly input: {
            conversationId: string
            userId: string
        }
    ) { }

    static create(input: {
        conversationId: string
        userId: string
    }): MarkAsRead {
        return new MarkAsRead(input)
    }
}