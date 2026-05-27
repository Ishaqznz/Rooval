import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { INotificationOrchestrator } from "../interface/notification.orch.interface";
import { INotificationUseCase } from "src/application/use-cases/interface/notification.usecase.interface";
import { INotificationService } from "src/application/services/notification.service.interface";
import { ICreateNotificationRequestDTO } from "src/application/dto/notification/request/create.request.dto";

@Injectable()
export class NotificationOrchestrator
    implements INotificationOrchestrator {

    constructor(
        @Inject(forwardRef(() => 'INotificationUseCase'))
        private readonly _notificationUseCase: INotificationUseCase,

        @Inject('INotificationService')
        private readonly _notificationService: INotificationService

    ) { }

    async notify(
        input: ICreateNotificationRequestDTO
    ): Promise<void> {
        const notification = await this._notificationUseCase.create(input);
        await this._notificationService
            .sendNotification(notification);
        await this.updateUnreadCount(
            input.receiverId
        );
    }

    async notifyMany(
        inputs: ICreateNotificationRequestDTO[]
    ): Promise<void> {
        for (const input of inputs) {
            await this.notify(input);
        }
    }

    async syncUserNotifications(
        userId: string
    ): Promise<void> {
        const notifications =
            await this._notificationUseCase
                .findByUserId(userId);
        await this._notificationService
            .sendNotifications(
                userId,
                notifications
            );
    }

    async updateUnreadCount(
        userId: string
    ): Promise<void> {

        const notifications =
            await this._notificationUseCase
                .findByUserId(userId);

        const unreadCount =
            notifications.filter(
                notification => !notification.isRead
            ).length;

        await this._notificationService
            .notifyUnreadCount(
                userId,
                unreadCount
            );
    }
}