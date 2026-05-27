import { MessageType } from "src/core/enums/conversations/conversation.enum";

export interface ISendMessagePayload {
  receiverId: string;
  message: string;
  type: MessageType;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
}

export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read'
}