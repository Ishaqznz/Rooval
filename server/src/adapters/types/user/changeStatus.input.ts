import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ChangeStatusInput {
    @Field()
    userId: string

    @Field()
    status: boolean
}