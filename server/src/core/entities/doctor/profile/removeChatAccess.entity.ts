export class RemoveChatAccess {
    constructor(
        public readonly input: {
            userId: string
            doctorId: string
        }
    ) {}

    static create(input: {
        userId: string
        doctorId: string
    }): RemoveChatAccess {
        return new RemoveChatAccess(input)
    }
}