import { MessageType } from "src/core/enums/conversations/conversation.enum"
import { Role } from "src/core/enums/user/role.enum"

export class CreateConversation {
    constructor(
        public readonly input: {
            participants: {
                userId: string
                role: Role
            }[]
            lastMessage: string
            lastMessageType: MessageType
            lastMessageAt: Date
        }
    ) { }

    static create(input: {
        participants: {
            userId: string
            role: Role
        }[]
        lastMessage: string
        lastMessageType: MessageType
        lastMessageAt: Date
    }) {
        return new CreateConversation(input)
    }
}