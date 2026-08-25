import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class GetConversationByIdInput {
    @Field()
    @IsString()
    conversationId: string
}