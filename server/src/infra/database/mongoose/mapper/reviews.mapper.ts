import { Review } from "src/core/entities/reviews/review.entity";
import { IMongoReviewDocument } from "../interfaces/documents/mongo.review.document";

export class ReviewMapper {
    static toEntity(
        input: IMongoReviewDocument
    ): Review {
        return Review.create({
            id: input._id.toString(),
            doctorId: input.doctorId.toString(),
            patientId: input.patientId.toString(),
            appointmentId: input.appointmentId.toString(),
            rating: input.rating,
            review: input.review,
            isVisible: input.isVisible,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt,
        });
    }

    static toEntities(
        input: IMongoReviewDocument[]
    ): Review[] {
        return input.map((doc) =>
            Review.create({
                id: doc._id.toString(),
                doctorId: doc.doctorId.toString(),
                patientId: doc.patientId.toString(),
                appointmentId: doc.appointmentId.toString(),
                rating: doc.rating,
                review: doc.review,
                isVisible: doc.isVisible,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })
        );
    }
}