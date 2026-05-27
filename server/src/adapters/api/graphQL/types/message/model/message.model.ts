import { Field, ID, ObjectType } from "@nestjs/graphql";
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces";
import { MessageSender } from "./messageSender.model";

@ObjectType()
export class Message {

    @Field(() => ID)
    id: string

    @Field()
    conversationId: string

    @Field(() => MessageSender)
    sender: MessageSender

    @Field()
    content: string

    @Field()
    type: string

    @Field({ nullable: true })
    fileUrl?: string;

    @Field({ nullable: true })
    fileName?: string;

    @Field({ nullable: true })
    mimeType?: string;

    @Field(() => MessageStatus)
    status: MessageStatus;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}