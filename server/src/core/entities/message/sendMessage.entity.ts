import { MessageType } from "../../enums/conversations/conversation.enum"
import { MessageStatus } from "../../interfaces/chat/chat.interfaces"

export class SendMessage {
    constructor(
        public readonly input: {
            conversationId: string
            senderId: string
            receiverId: string
            content: string
            status: MessageStatus
            type?:MessageType
            fileUrl?: string
            fileName?: string
            mimeType?: string
        }
    ) { }


    static create(input: {
        conversationId: string
        senderId: string
        receiverId: string
        content: string
        status: MessageStatus
        type?: MessageType
        fileUrl?: string
        fileName?: string
        mimeType?: string
    }): SendMessage {
        return new SendMessage(input)
    }
}