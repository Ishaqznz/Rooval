import { MessageType } from "../../../../core/enums/conversations/conversation.enum";
import { Role } from "../../../../core/enums/user/role.enum";
import { MessageStatus } from "../../../../core/interfaces/chat/chat.interfaces";

export interface IMessageResponseDTO {
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
  mimeType?: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}