import { CallPayloadResponse } from "src/core/interfaces/sessions/call.interface";
import { INotificationResponseDTO } from "../dto/notification/response/notification.response.dto";

export interface INotificationService {
    sendNotification(notification: INotificationResponseDTO): Promise<void>;
    sendNotifications(receiverId: string, notifications: INotificationResponseDTO[]): Promise<void>;
    notifyUnreadCount(receiverId: string, count: number): Promise<void>;
    sendCallNotification(receiverId: string, data: CallPayloadResponse): Promise<void>
}