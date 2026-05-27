import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Notification } from "../../types/notification/model/notification.model";
import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { Query } from "@nestjs/graphql";
import { GqlContext } from "src/common/types/gql-context.type";
import { INotificationUseCase } from "src/application/use-cases/interface/notification.usecase.interface";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { MarkAsReadInput } from "../../types/notification/input/markAsRead.input";
import { SendAdminNotificationInput } from "../../types/notification/input/sendAdminNotification.input";
import { JwtAdminGuard } from "src/common/guards/admin.guard";

@Injectable()
@Resolver(() => Notification)
export class NotificationResolver {
    constructor(
        @Inject("INotificationUseCase")
        private readonly _notificationUseCase: INotificationUseCase
    ) {}

    @Query(() => [Notification])
    @UseGuards(JwtAuthGuard)
    async findUserNotifications(
        @Context() context: GqlContext
    ): Promise<Notification[]> {
        const userId = context.req.user.userId
        return await this._notificationUseCase.findByUserId(userId)
    }

    @Mutation(() => Boolean)
    async markAsRead(
        @Args('input') input: MarkAsReadInput
    ): Promise<boolean> {
        return await this._notificationUseCase.markAsRead(input.notificationId)
    }

    @Mutation(() => Boolean) 
    @UseGuards(JwtAuthGuard)
    async markAllAsRead(
        @Context() context: GqlContext
    ): Promise<boolean> {
        const userId = context.req.user?.userId
        return await this._notificationUseCase.markAllAsRead(userId)
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAdminGuard)
    async sendAdminNotification(
        @Args('input') input: SendAdminNotificationInput
    ): Promise<boolean> {
        return await this._notificationUseCase.sendAdminNotification(input)
    }
}