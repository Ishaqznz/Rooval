import { Audience, NotificationType } from "../../../../core/enums/notifications/notification.enum";

export class ISendAdminNotificationRequestDTO {
    audience: Audience
    type: NotificationType
    content: string
}