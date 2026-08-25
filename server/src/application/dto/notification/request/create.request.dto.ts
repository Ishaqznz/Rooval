import { NotificationType } from "../../../../core/enums/notifications/notification.enum"

export interface ICreateNotificationRequestDTO {
    receiverId: string
    type: NotificationType
    content: string
    isRead: boolean
}