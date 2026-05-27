import { NotificationType } from "src/core/enums/notifications/notification.enum"

export interface INotificationResponseDTO {
    id: string
    receiverId: string
    type: NotificationType
    content: string
    isRead: boolean
    createdAt: Date
}