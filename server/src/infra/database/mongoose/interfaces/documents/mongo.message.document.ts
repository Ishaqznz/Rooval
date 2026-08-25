import { ObjectId } from "mongoose"
import { MessageType } from "../../../../../core/enums/conversations/conversation.enum"
import { Role } from "../../../../../core/enums/user/role.enum"
import { MessageStatus } from "../../../../../core/interfaces/chat/chat.interfaces"

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