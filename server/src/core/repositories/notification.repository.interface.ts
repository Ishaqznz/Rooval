import { ExtendedNotification } from "../entities/notifications/extendedNotification.entity";
import { Notification } from "../entities/notifications/notification.entity";

export interface INotificationRepository {
    create(entity: Notification): Promise<ExtendedNotification>
    findByUserId(userId: string): Promise<ExtendedNotification[]>
    marksAsRead(notificationId: string): Promise<boolean>
    markAllAsRead(userId: string): Promise<boolean>
}