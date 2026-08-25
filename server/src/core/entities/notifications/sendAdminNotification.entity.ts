import { Audience, NotificationType } from "../../enums/notifications/notification.enum";

export class SendAdminNotification {
    constructor(
        public readonly input: {
            audience: Audience,
            type: NotificationType,
            content: string
        }
    ) {}

    static create(
        input: {
            audience: Audience,
            type: NotificationType,
            content: string
        }
    ) {
        return new SendAdminNotification(input)
    }
}