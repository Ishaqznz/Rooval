import { InputType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class DeleteDoctorInput {
    @Field()
    @IsString()
    userId: string
}