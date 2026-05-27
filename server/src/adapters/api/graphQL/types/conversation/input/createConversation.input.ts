import { Field, InputType } from "@nestjs/graphql";
import {
    IsDate,
    IsEnum,
    IsString,
    ValidateNested
} from "class-validator";
import { ConversationParticipants } from "./conversationParticipants.input";
import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { Type } from "class-transformer";

@InputType()
export class CreateConversationInput {
    @Field(() => [ConversationParticipants])
    @ValidateNested({ each: true })
    @Type(() => ConversationParticipants)
    participants: ConversationParticipants[];

    @Field()
    @IsString()
    lastMessage: string

    @Field(() => MessageType)
    @IsEnum(MessageType)
    lastMessageType: MessageType

    @Field()
    @IsDate()
    lastMessageAt: Date
}