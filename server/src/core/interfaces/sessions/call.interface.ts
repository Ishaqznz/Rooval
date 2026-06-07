export interface CallRoom {
  appointmentId: string;
  userId: string;
  doctorId: string;
  userSocketId?: string;
  doctorSocketId?: string;
  startedAt?: Date;
  type: 'video' | 'audio';
}

export interface JoinRoomData { 
    appointmentId: string; 
    callType: 'video' | 'audio' 
}

export interface CallPayloadResponse {
  appointmentId: string;
  doctorName: string;
  callType: 'video' | 'audio';
}