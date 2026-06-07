import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { CreateReview } from "src/core/entities/reviews/createReview.entity";
import { Review } from "src/core/entities/reviews/review.entity";
import { IReviewsRepository } from "src/core/repositories/reviews.repository.interface";
import { MongoReviewSchema, ReviewDocument } from "../schemas/reviews/reviews.schema";
import { ReviewMapper } from "../mapper/reviews.mapper";
import { IMongoReviewDocument } from "../interfaces/documents/mongo.review.document";

@Injectable()
export class MongoReviewsRepository implements IReviewsRepository {
    constructor(
        @InjectModel(MongoReviewSchema.name)
        private readonly _reviewModel: Model<ReviewDocument>
    ) {}

    async createReview(
        entity: CreateReview
    ): Promise<boolean> {
        const review = await this._reviewModel.create({
            doctorId: new mongoose.Types.ObjectId(
                entity.input.doctorId
            ),

            patientId: new mongoose.Types.ObjectId(
                entity.input.patientId
            ),

            appointmentId: new mongoose.Types.ObjectId(
                entity.input.appointmentId
            ),

            rating: entity.input.rating,
            review: entity.input.review,
        });

        return !!review;
    }

    async getReviewByDoctorId(
        doctorId: string
    ): Promise<Review[]> {
        const reviews = await this._reviewModel
            .find({
                doctorId: new mongoose.Types.ObjectId(
                    doctorId
                ),
                isVisible: true,
            })
            .sort({ createdAt: -1 })
            .lean<IMongoReviewDocument[]>();

        return ReviewMapper.toEntities(reviews);
    }

    async getReviewByUserId(
        userId: string
    ): Promise<Review[]> {
        const reviews = await this._reviewModel
            .find({
                patientId: new mongoose.Types.ObjectId(
                    userId
                ),
                isVisible: true,
            })
            .sort({ createdAt: -1 })
            .lean<IMongoReviewDocument[]>();

        return ReviewMapper.toEntities(reviews);
    }
}