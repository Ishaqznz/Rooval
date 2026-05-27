import { ICreateNotificationRequestDTO } from "src/application/dto/notification/request/create.request.dto"
import { ISendAdminNotificationRequestDTO } from "src/application/dto/notification/request/send.request.dto"
import { INotificationResponseDTO } from "src/application/dto/notification/response/notification.response.dto"

export interface INotificationUseCase {
    create(input: ICreateNotificationRequestDTO): Promise<INotificationResponseDTO>
    findByUserId(userId: string): Promise<INotificationResponseDTO[]>
    markAsRead(notificationId: string): Promise<boolean>
    markAllAsRead(userId: string): Promise<boolean>
    sendAdminNotification(input: ISendAdminNotificationRequestDTO): Promise<boolean>
}