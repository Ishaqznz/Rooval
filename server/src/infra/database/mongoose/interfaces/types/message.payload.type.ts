import mongoose, { ObjectId } from "mongoose";
import { MessageType } from "src/core/enums/conversations/conversation.enum";
import { MessageStatus } from "src/core/interfaces/chat/chat.interfaces";

export type CreateMessagePayload = {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  status: MessageStatus
  type: MessageType
  fileUrl?: string;
  fileName?: string;
  mimeType?: string
};
