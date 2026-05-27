import { MessageType } from "src/core/enums/conversations/conversation.enum"

export interface IUpdateLastMessageRequestDTO {
    conversationId: string
    lastMessage: string
    lastMessageAt: Date
    lastMessageType: MessageType
}