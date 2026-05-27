import { ICreateNotificationRequestDTO } from "src/application/dto/notification/request/create.request.dto";
import { INotificationUseCase } from "../interface/notification.usecase.interface";
import { INotificationResponseDTO } from "src/application/dto/notification/response/notification.response.dto";
import { Notification } from "src/core/entities/notifications/notification.entity";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { INotificationRepository } from "src/core/repositories/notification.repository.interface";
import { NotificationOutputMapper } from "src/application/mapper/notification/notification.output.mapper";
import { ISendAdminNotificationRequestDTO } from "src/application/dto/notification/request/send.request.dto";
import { SendAdminNotification } from "src/core/entities/notifications/sendAdminNotification.entity";
import { IUserUseCase } from "../interface/user.usecase.interface";
import { Audience, NotificationErrorType } from "src/core/enums/notifications/notification.enum";
import { INotificationOrchestrator } from "src/application/orchestrators/interface/notification.orch.interface";
import { IDoctorUseCase } from "../interface/doctor.usecase.interface";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";

@Injectable()
export class NotificationUseCase implements INotificationUseCase {
    constructor(
        @Inject('INotificationRepository')
        private readonly _notificationRepository: INotificationRepository,

        @Inject(forwardRef(() => 'INotificationOrchestrator'))
        private readonly _notificationOrchestrator: INotificationOrchestrator,

        @Inject('IUserUseCase')
        private readonly _userUseCase: IUserUseCase,

        @Inject('IDoctorUseCase')
        private readonly _doctorUseCase: IDoctorUseCase
    ) { }

    async create(input: ICreateNotificationRequestDTO): Promise<INotificationResponseDTO> {
        const entity = Notification.create(input)
        return NotificationOutputMapper.toNotificationDTO(
            (await this._notificationRepository.create(entity))
        )
    }

    async findByUserId(userId: string): Promise<INotificationResponseDTO[]> {
        const entities = await this._notificationRepository.findByUserId(userId)
        return NotificationOutputMapper.toNotificationsDTO(entities)
    }

    async markAsRead(notificationId: string): Promise<boolean> {
        return await this._notificationRepository.marksAsRead(notificationId)
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        return await this._notificationRepository.markAllAsRead(userId)
    }

    async sendAdminNotification(input: ISendAdminNotificationRequestDTO): Promise<boolean> {
        const entity = SendAdminNotification.create(input)
        if (entity.input.audience == Audience.USER) {
            const users = await this._userUseCase.findAllUsers()
            const notifications: ICreateNotificationRequestDTO[] = []
            for (const user of users) {
                notifications.push({
                    type: input.type,
                    content: input.content,
                    isRead: false,
                    receiverId: user.id
                })
            }
            await this._notificationOrchestrator.notifyMany(notifications)
            return true
        }

        if (entity.input.audience == Audience.DOCTOR) {
            const doctors = await this._doctorUseCase.findAllDoctors()
            const notifications: ICreateNotificationRequestDTO[] = []
            for (const doctor of doctors) {
                notifications.push({
                    type: input.type,
                    content: input.content,
                    isRead: false,
                    receiverId: doctor.id
                })
            }

            await this._notificationOrchestrator.notifyMany(notifications)
            return true
        }

        if (entity.input.audience == Audience.BOTH) {
            const users = await this._userUseCase.findAllUsers()
            const doctors = await this._doctorUseCase.findAllDoctors()
            const notifications: ICreateNotificationRequestDTO[] = []
            const totalUsers = [...users, ...doctors]

            for (const user of totalUsers) {
                notifications.push({
                    type: input.type,
                    content: input.content,
                    isRead: false,
                    receiverId: user.id
                })
            }

            await this._notificationOrchestrator.notifyMany(notifications)
            return true
        }

        throw new BusinessRuleViolationError(NotificationErrorType.GIVE_VALID_AUDIENCE_TYPE)
    }
}