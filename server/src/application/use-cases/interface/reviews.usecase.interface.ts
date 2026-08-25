import { ICreateReviewRequestDTO } from "../../dto/reviews/request/create.request.dto";
import { IReviewResponseDTO } from "../../dto/reviews/response/review.response.dto";

export interface IReviewsUseCase {
    createReview(input: ICreateReviewRequestDTO): Promise<boolean>
    getReviewsByUserId(userId: string): Promise<IReviewResponseDTO[]>
    getReviewsByDoctorId(doctorId: string): Promise<IReviewResponseDTO[]>
}