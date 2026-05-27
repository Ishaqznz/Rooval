import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsEnum, IsString } from "class-validator";
import { MessageType } from "src/core/enums/conversations/conversation.enum";

@InputType()
export class UpdateLastMessageInput {
    @Field()
    @IsString()
    conversationId: string

    @Field()
    @IsString()
    lastMessage: string

    @Field()
    @IsDate()
    lastMessageAt:Date

    @Field(() => MessageType)
    @IsString()
    @IsEnum(MessageType)
    lastMessageType: MessageType
}