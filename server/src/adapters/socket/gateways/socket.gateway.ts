import { Inject, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/common/guards/socket.guard';
import { ISendMessagePayload } from 'src/core/interfaces/chat/chat.interfaces';
import { SocketConnectionHandler } from '../handlers/connection.handler';
import { IMessageUseCase } from 'src/application/use-cases/interface/message.usecase.interface';
import { MessageStatus } from 'src/core/interfaces/chat/chat.interfaces';
import { INotificationUseCase } from 'src/application/use-cases/interface/notification.usecase.interface';

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONT_END_URL,
    credentials: true,
  },
})

export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('IMessageUseCase')
    private readonly _messageUseCase: IMessageUseCase,
    @Inject('INotificationUseCase')
    private readonly _notificationUseCase: INotificationUseCase
  ) { }

  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>();

  async handleConnection(client: Socket) {
    if (!SocketConnectionHandler.authHandleConnection(client)) {
      console.log('disconnecting.....')
      client.disconnect()
      return;
    }

    const user = client.data.user;
    const userId = user?.userId;

    if (!userId) {
      console.log('Unauthorized connection, disconnecting...');
      client.disconnect();
      return;
    }

    client.join(userId)

    console.log('the time in handle connection: ', new Date().toISOString())

    this.userSocketMap.set(userId, client.id);
    console.log(`User connected: ${userId} -> ${client.id}`);
    client.broadcast.emit('user_online', { userId });
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    const userId = user?.userId;

    if (userId && this.userSocketMap.has(userId)) {
      this.userSocketMap.delete(userId);
      console.log(`User disconnected: ${userId}`);

      this.server.emit('user_offline', { userId });
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: ISendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) {
      console.log('Unauthorized message attempt...');
      return;
    }

    const sender = client.data.user;
    const senderId = sender?.userId as string;

    if (!senderId) {
      console.log('Unauthorized message attempt');
      return;
    }

    const payload = {
      senderId,
      content: data.message,
      status: 'sent' as MessageStatus,
      type: data.type,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      timestamp: new Date().toISOString(),
    };

    const receiverSocketId = this.userSocketMap.get(data.receiverId);

    const message = await this._messageUseCase.sendMessage({ ...payload, receiverId: data.receiverId })

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receive_message', message);
    } else {
      console.log('Receiver not online, message can be stored for later delivery');
    }
    
    client.emit('message_status', {
      status: receiverSocketId ? 'delivered' : 'sent',
      timestamp: payload.timestamp,
    });
  }

  @SubscribeMessage('receive_notifications')
  async recieveNotifications(
    @ConnectedSocket() client: Socket
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) {
      console.log('Un authorized message attempt!')
      return;
    }

    const userId = client.data.user?.userId
    console.log('the userId in the receiving notifications gateway: ', userId)
    const notifications = await this._notificationUseCase.findByUserId(userId)
    console.log('the notifications in the receiving notifications: ', notifications)
    this.server.to(client.id).emit('receive_notifications', notifications)
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection) {
      console.log('Unauthorized message attempt...');
      return;
    }
    const sender = client.data.user;
    const senderId = sender?.userId;
    if (!senderId) return;

    console.log("the typing socket data: ", data)

    const receiverSocketId = this.userSocketMap.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing', {
        senderId,
        isTyping: data.isTyping,
      });
    }
  }
}
