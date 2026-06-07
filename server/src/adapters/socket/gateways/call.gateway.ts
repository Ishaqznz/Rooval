import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/common/guards/socket.guard';
import { SocketConnectionHandler } from '../handlers/connection.handler';
import { CallRoom } from 'src/core/interfaces/sessions/call.interface';
import { JoinRoomData } from 'src/core/interfaces/sessions/call.interface';
import { INotificationUseCase } from 'src/application/use-cases/interface/notification.usecase.interface';

interface ExtendedCallRoom extends CallRoom {
  pendingCandidates: {
    user: RTCIceCandidateInit[];
    doctor: RTCIceCandidateInit[];
  };
  sdpState: {
    userHasRemoteSdp: boolean;
    doctorHasRemoteSdp: boolean;
  };
}

@UseGuards(WsAuthGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONT_END_URL,
    credentials: true,
  },
  namespace: '/call',
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('INotificationUseCase')
    private readonly _notificationUsecase: INotificationUseCase,
  ) {}

  @WebSocketServer()
  server: Server;

  private rooms = new Map<string, ExtendedCallRoom>();
  private userSocketMap = new Map<string, string>();

  private log(tag: string, msg: string, data?: any) {
    const ts = new Date().toISOString();
    if (data !== undefined) {
      console.log(`[${ts}][CallGateway][${tag}] ${msg}`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[${ts}][CallGateway][${tag}] ${msg}`);
    }
  }

  private warn(tag: string, msg: string, data?: any) {
    const ts = new Date().toISOString();
    console.warn(`[${ts}][CallGateway][${tag}] ⚠️  ${msg}`, data ?? '');
  }

  async handleConnection(client: Socket) {
    this.log('connect', `socket=${client.id} handshake auth=${JSON.stringify(client.handshake.auth)}`);

    if (!SocketConnectionHandler.authHandleConnection(client)) {
      this.warn('connect', `Auth failed for socket=${client.id} — disconnecting`);
      client.disconnect();
      return;
    }

    const userId = client.data.user?.userId;
    if (!userId) {
      this.warn('connect', `No userId on socket=${client.id} — disconnecting`);
      client.disconnect();
      return;
    }

    const prev = this.userSocketMap.get(userId);
    if (prev) {
      this.warn('connect', `userId=${userId} already mapped to socket=${prev}, overwriting with ${client.id}`);
    }

    this.userSocketMap.set(userId, client.id);
    this.log('connect', `userId=${userId} mapped to socket=${client.id}`);
    this.log('connect', `Total connected users: ${this.userSocketMap.size}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.userId;
    this.log('disconnect', `socket=${client.id} userId=${userId ?? 'unknown'}`);

    if (!userId) return;
    this.userSocketMap.delete(userId);

    for (const [appointmentId, room] of this.rooms.entries()) {
      if (room.userSocketId === client.id || room.doctorSocketId === client.id) {
        const isUser = room.userSocketId === client.id;
        const role = isUser ? 'user' : 'doctor';
        const otherSocketId = isUser ? room.doctorSocketId : room.userSocketId;

        this.log('disconnect', `${role} left room=${appointmentId}, notifying other side socket=${otherSocketId}`);

        if (otherSocketId) {
          this.server.to(otherSocketId).emit('call_ended', {
            appointmentId,
            reason: 'peer_disconnected',
          });
        }

        this.log('disconnect', `Deleting room=${appointmentId}`);
        this.rooms.delete(appointmentId);
        break;
      }
    }

    this.log('disconnect', `Active rooms after disconnect: ${this.rooms.size}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomData,
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const user = client.data.user;
    const userId: string = user.userId;
    const role: 'user' | 'doctor' =
      user.role?.toLowerCase() === 'doctor' ? 'doctor' : 'user';

    this.log('join_room', `userId=${userId} role=${role} appointmentId=${data.appointmentId} callType=${data.callType}`);

    client.join(data.appointmentId);

    let room = this.rooms.get(data.appointmentId) as ExtendedCallRoom | undefined;

    if (!room) {
      this.log('join_room', `Creating new room for appointmentId=${data.appointmentId}`);
      room = {
        appointmentId: data.appointmentId,
        userId: role === 'user' ? userId : '',
        doctorId: role === 'doctor' ? userId : '',
        type: data.callType,
        pendingCandidates: { user: [], doctor: [] },
        sdpState: { userHasRemoteSdp: false, doctorHasRemoteSdp: false },
      };
      this.rooms.set(data.appointmentId, room);
    } else {
      this.log('join_room', `Room already exists for appointmentId=${data.appointmentId}`, {
        hasUser: !!room.userSocketId,
        hasDoctor: !!room.doctorSocketId,
      });
    }

    if (role === 'user') {
      room.userSocketId = client.id;
      room.userId = userId;
    } else {
      room.doctorSocketId = client.id;
      room.doctorId = userId;
    }

    const bothPresent = !!(room.userSocketId && room.doctorSocketId);
    this.log('join_room', `Room state after join`, {
      appointmentId: data.appointmentId,
      userSocketId: room.userSocketId,
      doctorSocketId: room.doctorSocketId,
      bothPresent,
    });

    if (role === 'doctor') {
      if (room.userSocketId) {
        this.log('join_room', `Patient already in room, skipping push notification`);
      } else {
        this.log('join_room', `Patient NOT in room yet, sending call notification`);
        await this._notificationUsecase.sendCallNotification({
          appointmentId: data.appointmentId,
          callerType: data.callType,
        });
      }
    }

    client.to(data.appointmentId).emit('peer_joined', {
      appointmentId: data.appointmentId,
      role,
      callType: data.callType,
    });

    client.emit('room_state', {
      appointmentId: data.appointmentId,
      bothPresent,
      callType: data.callType,
    });
  }

  @SubscribeMessage('call_offer')
  handleOffer(
    @MessageBody() data: { appointmentId: string; sdp: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const room = this.rooms.get(data.appointmentId);
    this.log('call_offer', `appointmentId=${data.appointmentId} sdp.type=${data.sdp?.type}`, {
      targetSocket: room?.userSocketId ?? 'NOT FOUND',
      hasRoom: !!room,
    });

    if (!room) {
      this.warn('call_offer', `No room found for appointmentId=${data.appointmentId} — offer will not be relayed!`);
      return;
    }

    const targetSocketId = room.userSocketId;
    if (!targetSocketId) {
      this.warn('call_offer', `Patient socket not in room yet for appointmentId=${data.appointmentId}`);
    }

    room.sdpState.doctorHasRemoteSdp = false; 
    room.sdpState.userHasRemoteSdp = false; 

    this.log('call_offer', `Relaying offer to room ${data.appointmentId}`);
    client.to(data.appointmentId).emit('incoming_call', {
      appointmentId: data.appointmentId,
      sdp: data.sdp,
    });
  }

  @SubscribeMessage('call_answer')
  handleAnswer(
    @MessageBody() data: { appointmentId: string; sdp: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const room = this.rooms.get(data.appointmentId);
    this.log('call_answer', `appointmentId=${data.appointmentId} sdp.type=${data.sdp?.type}`, {
      targetSocket: room?.doctorSocketId ?? 'NOT FOUND',
      hasRoom: !!room,
    });

    if (!room) {
      this.warn('call_answer', `No room for appointmentId=${data.appointmentId} — answer dropped!`);
      return;
    }

    room.startedAt = new Date();

    room.sdpState.userHasRemoteSdp = true;
    room.sdpState.doctorHasRemoteSdp = true;

    this.log('call_answer', `Relaying answer to room ${data.appointmentId}`);
    client.to(data.appointmentId).emit('call_answered', {
      appointmentId: data.appointmentId,
      sdp: data.sdp,
    });

    this.flushPendingCandidates(data.appointmentId, room);
  }

  @SubscribeMessage('ice_candidate')
  handleIceCandidate(
    @MessageBody() data: { appointmentId: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const room = this.rooms.get(data.appointmentId) as ExtendedCallRoom | undefined;
    const senderRole = this.getRoleForSocket(client.id, room);

    const candidateType = this.parseCandidateType(data.candidate?.candidate);

    this.log('ice_candidate', `from=${senderRole} appointmentId=${data.appointmentId} type=${candidateType}`, {
      candidate: data.candidate?.candidate?.substring(0, 80) + '...',
    });

    if (!room) {
      this.warn('ice_candidate', `No room=${data.appointmentId} — candidate dropped!`);
      return;
    }

    const receiverRole = senderRole === 'user' ? 'doctor' : 'user';
    const receiverHasSdp =
      receiverRole === 'doctor'
        ? room.sdpState.doctorHasRemoteSdp
        : room.sdpState.userHasRemoteSdp;

    if (!receiverHasSdp) {
      this.warn('ice_candidate',
        `Receiver (${receiverRole}) has no remote SDP yet — queuing candidate for appointmentId=${data.appointmentId}`,
      );
      room.pendingCandidates[receiverRole].push(data.candidate);
      this.log('ice_candidate', `Queue size for ${receiverRole}: ${room.pendingCandidates[receiverRole].length}`);
      return;
    }

    this.log('ice_candidate', `Forwarding candidate to ${receiverRole} in room ${data.appointmentId}`);
    client.to(data.appointmentId).emit('ice_candidate', {
      appointmentId: data.appointmentId,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('end_call')
  handleEndCall(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const userId = client.data.user?.userId;
    this.log('end_call', `userId=${userId} appointmentId=${data.appointmentId}`);

    client.to(data.appointmentId).emit('call_ended', {
      appointmentId: data.appointmentId,
      reason: 'ended_by_peer',
    });

    this.rooms.delete(data.appointmentId);
    client.leave(data.appointmentId);
    this.log('end_call', `Room ${data.appointmentId} deleted. Active rooms: ${this.rooms.size}`);
  }

  @SubscribeMessage('media_toggle')
  handleMediaToggle(
    @MessageBody() data: { appointmentId: string; audio: boolean; video: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    if (!SocketConnectionHandler.authHandleConnection(client)) return;

    const userId = client.data.user?.userId;
    this.log('media_toggle', `userId=${userId} audio=${data.audio} video=${data.video} room=${data.appointmentId}`);

    client.to(data.appointmentId).emit('peer_media_toggle', {
      audio: data.audio,
      video: data.video,
    });
  }

  private flushPendingCandidates(appointmentId: string, room: ExtendedCallRoom) {
    const { user: userQueue, doctor: doctorQueue } = room.pendingCandidates;

    if (userQueue.length > 0) {
      this.log('flush', `Sending ${userQueue.length} queued candidates to user socket=${room.userSocketId}`);
      userQueue.forEach((candidate) => {
        if (room.userSocketId) {
          this.server.to(room.userSocketId).emit('ice_candidate', { appointmentId, candidate });
        }
      });
      room.pendingCandidates.user = [];
    }

    if (doctorQueue.length > 0) {
      this.log('flush', `Sending ${doctorQueue.length} queued candidates to doctor socket=${room.doctorSocketId}`);
      doctorQueue.forEach((candidate) => {
        if (room.doctorSocketId) {
          this.server.to(room.doctorSocketId).emit('ice_candidate', { appointmentId, candidate });
        }
      });
      room.pendingCandidates.doctor = [];
    }
  }

  private getRoleForSocket(
    socketId: string,
    room: ExtendedCallRoom | undefined,
  ): 'user' | 'doctor' | 'unknown' {
    if (!room) return 'unknown';
    if (room.userSocketId === socketId) return 'user';
    if (room.doctorSocketId === socketId) return 'doctor';
    return 'unknown';
  }

  private parseCandidateType(candidateStr?: string): string {
    if (!candidateStr) return 'null/end-of-candidates';
    const match = candidateStr.match(/typ\s+(\w+)/);
    return match ? match[1] : 'unknown';
  }
}