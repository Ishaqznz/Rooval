import { Injectable } from "@nestjs/common";
import { INotificationService } from "src/application/services/notification.service.interface";
import { INotificationResponseDTO } from "src/application/dto/notification/response/notification.response.dto";
import { ChatGateway } from "src/adapters/socket/gateways/socket.gateway";
import { CallPayloadResponse } from "src/core/interfaces/sessions/call.interface";

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        private readonly _chatGateway: ChatGateway
    ) {}

    async sendNotification(notification: INotificationResponseDTO): Promise<void> {
        this._chatGateway.server
            .to(notification.receiverId)
            .emit(
                'receive_notification',
                notification
            );
    }

    async sendNotifications(receiverId: string, notifications: INotificationResponseDTO[]): Promise<void> {
        this._chatGateway.server
            .to(receiverId)
            .emit(
                'receive_notifications',
                notifications
            );
    }

    async notifyUnreadCount(receiverId: string, count: number): Promise<void> {
        this._chatGateway.server
            .to(receiverId)
            .emit(
                'notification_count',
                count
            );
    }

    async sendCallNotification(receiverId: string, data: CallPayloadResponse): Promise<void> {
        console.log('the reciever Idddddddddddddddddddddd: ', receiverId, data)
        this._chatGateway.server
            .to(receiverId.toString())
            .emit(
                'incoming_call_notification',
                data
            )
    }
}