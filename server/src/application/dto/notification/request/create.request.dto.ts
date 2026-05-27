import { NotificationType } from "src/core/enums/notifications/notification.enum"

export interface ICreateNotificationRequestDTO {
    receiverId: string
    type: NotificationType
    content: string
    isRead: boolean
}