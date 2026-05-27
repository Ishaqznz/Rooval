import { ExtendedNotification } from "src/core/entities/notifications/extendedNotification.entity";
import { IMongoNotificationDocument } from "../interfaces/documents/mongo.notification.document";

export class NotificationMapper {
    static toNotificationEntities(input: IMongoNotificationDocument[]): ExtendedNotification[] {
        const entities = input.map((doc) => {
            return ExtendedNotification.create({
                id: doc._id.toString(),
                receiverId: doc.receiverId.toString(),
                type: doc.type,
                content: doc.content,
                isRead: doc.isRead,
                createdAt: doc.createdAt
            })
        })

        return entities;
    }

    static toNotificationEntity(input: IMongoNotificationDocument): ExtendedNotification {
        return ExtendedNotification.create({
            id: input._id.toString(),
            receiverId: input.receiverId.toString(),
            type: input.type,
            content: input.content,
            isRead: input.isRead,
            createdAt: input.createdAt
        })
    }
}