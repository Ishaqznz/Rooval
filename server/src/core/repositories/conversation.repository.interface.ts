import { Conversation } from "../entities/conversation/conversation.entity";
import { CreateConversation } from "../entities/conversation/createConversation.entity";
import { UpdateLastMessage } from "../entities/conversation/updateLastMessage.entity";

export interface IConversationRepository {
    getConversation(userIds: string[]): Promise<Conversation | null>
    createConversation(entity: CreateConversation): Promise<Conversation>
    getUserConversations(userId: string): Promise<Conversation[]>
    getConversationById(conversationId: string): Promise<Conversation>
    updateLastMessage(entity: UpdateLastMessage): Promise<boolean>
}