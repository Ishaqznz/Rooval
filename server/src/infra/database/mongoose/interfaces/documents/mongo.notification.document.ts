import { ObjectId } from "mongoose"
import { NotificationType } from "src/core/enums/notifications/notification.enum"

export interface IMongoNotificationDocument {
    _id: ObjectId
    receiverId: ObjectId
    type: NotificationType
    content: string
    isRead: boolean
    createdAt: Date
    updatedAt: Date
    __v: number
}