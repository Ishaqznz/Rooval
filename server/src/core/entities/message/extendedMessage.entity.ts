import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { Role } from "src/core/enums/user/role.enum";
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces";

export class ExtendedMessage {
    constructor(
        public readonly input: {
            id: string;
            conversationId: string;
            sender: {
                userId: string;
                role: Role;
            };
            content: string;
            type: MessageType;
            fileUrl?: string;
            fileName?: string;
            mimeType?: string
            status: MessageStatus;
            createdAt: Date;
            updatedAt: Date;

        }
    ) { }

    static create(input: {
        id: string;
        conversationId: string;
        sender: {
            userId: string;
            role: Role;
        };
        content: string;
        type: MessageType;
        fileUrl?: string;
        fileName?: string;
        mimeType?: string
        status: MessageStatus;
        createdAt: Date;
        updatedAt: Date;
    }): ExtendedMessage {
        return new ExtendedMessage(input)
    }
}