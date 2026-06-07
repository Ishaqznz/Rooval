import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateReviewInput } from "../../types/reviews/input/createReview.input";
import { GqlContext } from "src/common/types/gql-context.type";
import { IReviewsUseCase } from "src/application/use-cases/interface/reviews.usecase.interface";
import { Review } from "../../types/reviews/model/review.model";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { FindReviewsByDoctorIdInput } from "../../types/reviews/input/findReviewsByDoctorId.input";

@Injectable()
@Resolver(() => Review)
export class ReviewsResolver {
    constructor(
        @Inject('IReviewsUseCase')
        private readonly _reviewsUseCase: IReviewsUseCase
    ) {}

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async createReview(
        @Args('input') input: CreateReviewInput,
        @Context() context: GqlContext 
    ): Promise<boolean> {
        const userId = context.req.user.userId
        return await this._reviewsUseCase.createReview({ patientId: userId, ...input })
    }

    @Query(() => [Review])
    @UseGuards(JwtAuthGuard)
    async getReviewsByUserId(
        @Context() context: GqlContext
    ): Promise<Review[]> {
        const userId = context.req.user.userId
        return await this._reviewsUseCase.getReviewsByUserId(userId);
    }

    @Query(() => [Review])
    @UseGuards(JwtAuthGuard)
    async getReviewsByDoctorId(
        @Context() context: GqlContext
    ): Promise<Review[]> {
        const doctorId = context.req.user.userId
        return await this._reviewsUseCase.getReviewsByDoctorId(doctorId)
    }

    @Query(() => [Review])
    @UseGuards(JwtAuthGuard)
    async findReviewsByDoctorId(
        @Args('input') input: FindReviewsByDoctorIdInput
    ): Promise<Review[]> {
        return await this._reviewsUseCase.getReviewsByDoctorId(input.doctorId)
    }
}   