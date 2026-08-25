import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { Audience, NotificationType } from "../../../../../../core/enums/notifications/notification.enum";

@InputType()
export class SendAdminNotificationInput {
    @Field(() => Audience)
    @IsEnum(Audience)
    audience: Audience

    @Field(() => NotificationType)
    @IsEnum(NotificationType)
    type: NotificationType

    @Field()
    @IsString()
    content: string
}