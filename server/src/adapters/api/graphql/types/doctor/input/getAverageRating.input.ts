import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class GetAverageRatingInput {
    @Field()
    @IsString()
    doctorId: string
}