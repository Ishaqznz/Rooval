import { INotificationResponseDTO } from "src/application/dto/notification/response/notification.response.dto";
import { ExtendedNotification } from "src/core/entities/notifications/extendedNotification.entity";

export class NotificationOutputMapper {
    static toNotificationsDTO(entities: ExtendedNotification[]): INotificationResponseDTO[] {
        const dtos = entities.map((entity) => ({
            id: entity.input.id,
            receiverId: entity.input.receiverId,
            type: entity.input.type,
            content: entity.input.content,
            isRead: entity.input.isRead,
            createdAt: entity.input.createdAt
        }))

        return dtos
    }

    static toNotificationDTO(entity: ExtendedNotification): INotificationResponseDTO {
        console.log('the input in the toNotificationDTO: ', entity.input)
        return {
            id: entity.input.id,
            receiverId: entity.input.receiverId,
            type: entity.input.type,
            content: entity.input.content,
            isRead: entity.input.isRead,
            createdAt: entity.input.createdAt
        }
    }
}