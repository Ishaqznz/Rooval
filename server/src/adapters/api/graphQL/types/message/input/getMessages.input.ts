import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class GetMessagesInput {
    @Field()
    @IsString()
    conversationId: string
}