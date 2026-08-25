import { ICreateNotificationRequestDTO } from "../../dto/notification/request/create.request.dto"
import { ISendAdminNotificationRequestDTO } from "../../dto/notification/request/send.request.dto"
import { INotificationResponseDTO } from "../../dto/notification/response/notification.response.dto"
import { ISendCallNotificationRequest } from "../../dto/notification/request/sendCallNotification.request.dto"

export interface INotificationUseCase {
    create(input: ICreateNotificationRequestDTO): Promise<INotificationResponseDTO>
    findByUserId(userId: string): Promise<INotificationResponseDTO[]>
    markAsRead(notificationId: string): Promise<boolean>
    markAllAsRead(userId: string): Promise<boolean>
    sendAdminNotification(input: ISendAdminNotificationRequestDTO): Promise<boolean>
    sendCallNotification(input: ISendCallNotificationRequest): Promise<void>
}