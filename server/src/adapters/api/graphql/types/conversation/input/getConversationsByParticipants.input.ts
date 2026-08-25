import { Field, InputType } from "@nestjs/graphql";
import { IsArray } from "class-validator";

@InputType()
export class GetConversationsByParticipantsInput {
    @Field(() => [String])
    @IsArray()
    userIds: string[]
}