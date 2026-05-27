import { MessageType } from "src/core/enums/conversations/conversation.enum"

export class UpdateLastMessage {
    constructor(
        public readonly input: {
            conversationId: string
            lastMessage: string
            lastMessageType: MessageType
        }
    ) { }

    static create(input: {
        conversationId: string
        lastMessage: string
        lastMessageType: MessageType
    }): UpdateLastMessage {
        return new UpdateLastMessage(input)
    }
}