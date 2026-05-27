import { MessageType } from "src/core/enums/conversations/conversation.enum"

export interface ICreateConversationRequestDTO {
    participants: {
        userId: string
    }[],
    lastMessage: string
    lastMessageType: MessageType
    lastMessageAt: Date
}