import { NotificationType } from "../../../../core/enums/notifications/notification.enum"

export interface INotificationResponseDTO {
    id: string
    receiverId: string
    type: NotificationType
    content: string
    isRead: boolean
    createdAt: Date
}