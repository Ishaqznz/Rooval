import { ICreateNotificationRequestDTO } from "src/application/dto/notification/request/create.request.dto";

export interface INotificationOrchestrator {
    notify(input: ICreateNotificationRequestDTO): Promise<void>;
    notifyMany(inputs: ICreateNotificationRequestDTO[]): Promise<void>;
    syncUserNotifications(userId: string): Promise<void>;
    updateUnreadCount(userId: string): Promise<void>;
}