import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class GetDoctorInput {
    @Field()
    @IsString()
    doctorId: string
}