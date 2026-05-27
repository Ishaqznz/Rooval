import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = () => {
  if (socket && socket.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL as string, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};