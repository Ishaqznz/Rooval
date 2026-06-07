export interface IMongoReviewDocument {
    _id: string,
    doctorId: string,
    patientId: string,
    appointmentId: string,
    rating: number,
    review: string,
    isVisible: boolean,
    createdAt: Date,
    updatedAt: Date,
}