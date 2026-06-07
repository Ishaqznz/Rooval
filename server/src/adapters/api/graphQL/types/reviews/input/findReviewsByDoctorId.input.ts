import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class FindReviewsByDoctorIdInput {
    @Field()
    @IsString()
    doctorId: string
}