import { Field, ObjectType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { NotificationType } from "src/core/enums/notifications/notification.enum";

@ObjectType()
export class Notification {
    @Field()
    id: string

    @Field()
    receiverId: string

    @Field(() => NotificationType)
    @IsEnum(NotificationType)
    type: NotificationType

    @Field()
    content: string

    @Field()
    isRead: boolean

    @Field()
    createdAt: Date
}
 