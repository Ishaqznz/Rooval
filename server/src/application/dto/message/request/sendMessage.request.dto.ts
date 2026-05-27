import { MessageType } from "src/core/enums/conversations/conversation.enum"
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces"

export interface ISendMessageRequestDTO {
    senderId: string
    receiverId: string
    content: string
    status: MessageStatus
    type?: MessageType
    fileUrl?: string
    fileName?: string
    mimeType?: string
}