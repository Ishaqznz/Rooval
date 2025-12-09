import { InputType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";


@InputType()
export class ChangeDoctorStatusInput {
    @Field()
    @IsString()
    userId: string

    @Field()
    @IsString()
    status: string
}