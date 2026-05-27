import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "src/core/entities/notifications/notification.entity";
import { INotificationRepository } from "src/core/repositories/notification.repository.interface";
import { MongoNotificationSchema } from "../schemas/notification/notification.schema";
import { NotificationDocument } from "../schemas/notification/notification.schema";
import mongoose, { Model } from "mongoose";
import { ExtendedNotification } from "src/core/entities/notifications/extendedNotification.entity";
import { IMongoNotificationDocument } from "../interfaces/documents/mongo.notification.document";
import { NotificationMapper } from "../mapper/notification.mapper";

export class NotificationRepository implements INotificationRepository {
    constructor(
        @InjectModel(MongoNotificationSchema.name)
        private readonly _notificationModel: Model<NotificationDocument>
    ) { }

    async create(entity: Notification): Promise<ExtendedNotification> {
        const notification = await this._notificationModel.create({
            receiverId: new mongoose.Types.ObjectId(entity.input.receiverId),
            type: entity.input.type,
            content: entity.input.content,
            isRead: entity.input.isRead
        }) as unknown as IMongoNotificationDocument

        return NotificationMapper.toNotificationEntity(notification)
    }

    async findByUserId(userId: string): Promise<ExtendedNotification[]> {
        const userMongooseObjectId = new mongoose.Types.ObjectId(userId)
        const notifications = await this._notificationModel
            .find({
                receiverId: userMongooseObjectId
            })
            .sort({ createdAt: -1 })
            .lean<IMongoNotificationDocument[]>();
        console.log('all the notifications in the repo: ', notifications)
        return NotificationMapper.toNotificationEntities(notifications)
    }

    async marksAsRead(notificationId: string): Promise<boolean> {
        const update = await this._notificationModel.findByIdAndUpdate(notificationId, {
            isRead: true
        })
        
        return !!update;
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const userMongooseObjectId = new mongoose.Types.ObjectId(userId)
        const update = await this._notificationModel.updateMany({ receiverId: userMongooseObjectId }, {
            $set: { isRead: true }
        })

        return !!update
    }
}