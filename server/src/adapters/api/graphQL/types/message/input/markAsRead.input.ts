import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class MarkAsReadInput {
    @Field()
    @IsString()
    conversationId: string

    @Field()
    @IsString()
    userId: string
}