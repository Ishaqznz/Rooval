import { IReviewResponseDTO } from "src/application/dto/reviews/response/review.response.dto";
import { Review } from "src/core/entities/reviews/review.entity";

export class ReviewOutputMapper {
    static toReviewDtos(entities: Review[]): IReviewResponseDTO[] {
        const result: IReviewResponseDTO[] = entities.map((e) => {
            return {
                id: e.input.id,
                doctorId: e.input.doctorId,
                patientId: e.input.patientId,
                appointmentId: e.input.appointmentId,
                rating: e.input.rating,
                review: e.input.review,
                isVisible: e.input.isVisible,
                createdAt: e.input.createdAt,
                updatedAt: e.input.updatedAt
            }
        })

        return result
    }
}