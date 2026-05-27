import { NotificationType } from "src/core/enums/notifications/notification.enum"

export class Notification {
    constructor(
        public readonly input: {
            receiverId: string
            type: NotificationType
            content: string
            isRead: boolean
        }
    ) { }

    static create(input: {
        receiverId: string
        type: NotificationType
        content: string
        isRead: boolean
    }) {
        return new Notification(input)
    }
}