export class CreateReview {
    constructor(
        public readonly input: {
            doctorId: string
            patientId: string
            appointmentId: string
            rating: number
            review: string
        }
    ) { }

    static create(
        input: {
            doctorId: string
            patientId: string
            appointmentId: string
            rating: number
            review: string
        }
    ): CreateReview {
        return new CreateReview(input)
    }
}