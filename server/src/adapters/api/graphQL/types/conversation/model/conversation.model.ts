import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ConversationParticipantsModel } from "./conversationParticipants.model";
import { MessageType } from "src/core/enums/conversations/conversation.enum";

@ObjectType()
export class Conversation {
    @Field(() => ID)
    id: string

    @Field(() => [ConversationParticipantsModel])
    participants: ConversationParticipantsModel[]

    @Field()
    lastMessage: string

    @Field()
    lastMessageType: MessageType

    @Field()
    lastMessageAt: Date
    
    @Field()
    createdAt: Date

    @Field()
    updatedAt: Date
}