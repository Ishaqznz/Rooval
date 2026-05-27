import { getSocket } from "./socket";

export interface SendMessagePayload {
  receiverId: string;
  message: string;
  type: "text" | "emoji" | "document" | "image";
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
}

export const sendMessage = (payload: SendMessagePayload) => {
  const socket = getSocket();
  if (!socket) {
    console.error("Socket not connected");
    return;
  }
  socket.emit("send_message", payload);
};

export const onReceiveMessage = (
  callback: (data: {
    senderId: string;
    message: string;
    type: "text" | "emoji" | "document";
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    timestamp: string;
  }) => void
) => {
  const socket = getSocket();
  if (!socket) return;
  socket.on("receive_message", callback);
  return () => socket.off("receive_message", callback);
};