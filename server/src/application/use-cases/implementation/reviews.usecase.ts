import { Inject, Injectable } from "@nestjs/common";
import { IReviewsUseCase } from "../interface/reviews.usecase.interface";
import { ICreateReviewRequestDTO } from "../../dto/reviews/request/create.request.dto";
import { CreateReview } from "../../../core/entities/reviews/createReview.entity";
import { IReviewsRepository } from "../../../core/repositories/reviews.repository.interface";
import { IReviewResponseDTO } from "../../dto/reviews/response/review.response.dto";
import { ReviewOutputMapper } from "../../mapper/reviews/reviews.output.mapper";
import { IAppointmentUseCase } from "../interface/appointment.usecase.interface";

@Injectable()
export class ReviewsUseCase implements IReviewsUseCase {
    constructor(
        @Inject('IReviewsRepository')
        private readonly _reviewsRepository: IReviewsRepository,

        @Inject('IAppointmentUseCase')
        private readonly _appointmentUseCase: IAppointmentUseCase
    ) {}

    async createReview(input: ICreateReviewRequestDTO): Promise<boolean> {
        const entity = CreateReview.create(input)
        await this._reviewsRepository.createReview(entity)
        return await this._appointmentUseCase.changeReviewStatus(input.appointmentId, true)
    }

    async getReviewsByUserId(userId: string): Promise<IReviewResponseDTO[]> { 
        const entities = await this._reviewsRepository.getReviewByUserId(userId)
        return ReviewOutputMapper.toReviewDtos(entities)
    }

    async getReviewsByDoctorId(doctorId: string): Promise<IReviewResponseDTO[]> {
        const entities = await this._reviewsRepository.getReviewByDoctorId(doctorId)
        return ReviewOutputMapper.toReviewDtos(entities)
    }
}