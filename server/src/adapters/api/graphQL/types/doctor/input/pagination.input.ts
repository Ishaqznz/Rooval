import { InputType, Field } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@InputType()
export class PaginationInput {
    @Field()
    @IsNumber()
    page: number

    @Field()
    @IsNumber()
    limit: number
}