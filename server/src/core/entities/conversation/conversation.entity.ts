import { MessageType } from "src/core/enums/conversations/conversation.enum"
import { Role } from "src/core/enums/user/role.enum"

export class Conversation {
    constructor(
        public readonly input: {
            id: string
            participants: {
                userId: string
                role: Role
            }[]
            lastMessage: string
            lastMessageType: MessageType
            lastMessageAt: Date
            createdAt: Date
            updatedAt: Date
        }
    ) { }

    static create(input: {
        id: string
        participants: {
            userId: string
            role: Role
        }[]
        lastMessage: string
        lastMessageType: MessageType
        lastMessageAt: Date
        createdAt: Date
        updatedAt: Date
    }): Conversation {
        return new Conversation(input)
    }
}