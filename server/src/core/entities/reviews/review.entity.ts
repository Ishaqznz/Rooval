export class Review {
    constructor(
        public readonly input: {
            id: string
            doctorId: string
            patientId: string
            appointmentId: string
            rating: number
            review: string
            isVisible: boolean
            createdAt: Date
            updatedAt: Date
        }
    ) { }

    static create(input: {
        id: string
        doctorId: string
        patientId: string
        appointmentId: string
        rating: number
        review: string
        isVisible: boolean
        createdAt: Date
        updatedAt: Date
    }): Review {
        return new Review(input)
    }
}