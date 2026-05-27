import { Field, InputType } from "@nestjs/graphql";
import {
    IsEnum,
    IsOptional,
    IsString
} from "class-validator";
import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces";

@InputType()
export class SendMessageInput {
    @Field()
    @IsString()
    senderId: string

    @Field()
    @IsString()
    receiverId: string

    @Field()
    @IsString()
    content: string

    @Field()
    status: MessageStatus

    @Field(() => MessageType, { nullable: true })
    @IsEnum(MessageType)
    @IsOptional()
    type?: MessageType

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    fileUrl?: string

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    fileName?: string

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    mimeType?: string
}