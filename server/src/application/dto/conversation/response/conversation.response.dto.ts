import { MessageType } from "../../../../core/enums/conversations/conversation.enum";
import { Role } from "../../../../core/enums/user/role.enum";

export interface IConversationResponseDTO {
    id: string;
    participants: {
        userId: string
        role: Role
    }[]
    lastMessage: string;
    lastMessageType: MessageType;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}