export class GrantChatAccess {
    constructor(
        public readonly input: {
            userId: string
            doctorId: string
        }
    ) {}

    static create(input: {
        userId: string
        doctorId: string
    }) {
        return new GrantChatAccess(input)
    }
}