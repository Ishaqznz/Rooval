import { ObjectId } from "mongoose"
import { LastMessageType } from "src/core/enums/conversations/conversation.enum"
import { Role } from "src/core/enums/user/role.enum"

export interface IMongoConversationDocument {
    _id: ObjectId
    participants: {
        userId: ObjectId
        role: Role
    }[]
    lastMessage: string
    lastMessageType: LastMessageType
    lastMessageAt: Date
    createdAt: Date
    updatedAt: Date
    __v: number
}