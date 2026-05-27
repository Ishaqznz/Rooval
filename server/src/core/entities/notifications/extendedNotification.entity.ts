import { NotificationType } from "src/core/enums/notifications/notification.enum"

export class ExtendedNotification {
    constructor(
        public readonly input: {
            id: string
            receiverId: string
            type: NotificationType
            content: string
            isRead: boolean
            createdAt: Date
        }
    ) { }

    static create(input: {
        id: string
        receiverId: string
        type: NotificationType
        content: string
        isRead: boolean
        createdAt: Date
    }): ExtendedNotification {
        return new ExtendedNotification(input)
    }
}