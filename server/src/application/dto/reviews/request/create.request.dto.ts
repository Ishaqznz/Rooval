export interface ICreateReviewRequestDTO {
    doctorId: string
    patientId: string
    appointmentId: string
    rating: number
    review: string
}