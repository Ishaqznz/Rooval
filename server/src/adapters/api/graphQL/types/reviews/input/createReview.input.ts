import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@InputType()
export class CreateReviewInput {
    @Field()
    @IsString()
    doctorId: string

    @Field()
    @IsString()
    appointmentId: string

    @Field()
    @IsNumber()
    rating: number

    @Field()
    @IsString()
    review: string
}