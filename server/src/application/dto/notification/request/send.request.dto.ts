import { Audience, NotificationType } from "src/core/enums/notifications/notification.enum";

export class ISendAdminNotificationRequestDTO {
    audience: Audience
    type: NotificationType
    content: string
}