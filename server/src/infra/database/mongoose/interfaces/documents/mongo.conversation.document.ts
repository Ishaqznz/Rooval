import { ObjectId } from "mongoose"
import { LastMessageType } from "../../../../../core/enums/conversations/conversation.enum"
import { Role } from "../../../../../core/enums/user/role.enum"

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