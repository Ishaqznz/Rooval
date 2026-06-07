import { ICreateReviewRequestDTO } from "src/application/dto/reviews/request/create.request.dto";
import { IReviewResponseDTO } from "src/application/dto/reviews/response/review.response.dto";

export interface IReviewsUseCase {
    createReview(input: ICreateReviewRequestDTO): Promise<boolean>
    getReviewsByUserId(userId: string): Promise<IReviewResponseDTO[]>
    getReviewsByDoctorId(doctorId: string): Promise<IReviewResponseDTO[]>
}