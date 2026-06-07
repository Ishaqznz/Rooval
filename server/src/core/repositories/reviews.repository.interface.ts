import { CreateReview } from "../entities/reviews/createReview.entity";
import { Review } from "../entities/reviews/review.entity";

export interface IReviewsRepository {
    createReview(entity: CreateReview): Promise<boolean>
    getReviewByUserId(userId: string): Promise<Review[]>
    getReviewByDoctorId(doctorId: string): Promise<Review[]>
}