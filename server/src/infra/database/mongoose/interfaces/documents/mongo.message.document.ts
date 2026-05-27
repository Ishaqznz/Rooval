import { ObjectId } from "mongoose"
import { MessageType } from "src/core/enums/conversations/conversation.enum"
import { Role } from "src/core/enums/user/role.enum"
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces"

export interface IMongoMessageDocument {
    _id: ObjectId
    conversationId: string
    senderId: string
    senderRole: Role
    content: string
    type: MessageType
    fileUrl?: string
    fileName?: string
    status?: MessageStatus
    createdAt: Date
    updatedAt: Date
}