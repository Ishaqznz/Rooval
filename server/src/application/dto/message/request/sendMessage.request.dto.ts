import { MessageType } from "../../../../core/enums/conversations/conversation.enum"
import { MessageStatus } from "../../../../core/interfaces/chat/chat.interfaces"

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