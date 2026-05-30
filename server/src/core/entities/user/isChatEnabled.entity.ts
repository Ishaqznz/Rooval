export class IsChatEnabled {
    constructor (
        public readonly input: {
            userId: string
            doctorId: string
        }
    ) {}

    static create(input: {
        userId: string
        doctorId: string
    }): IsChatEnabled {
        return new IsChatEnabled(input)
    }
}