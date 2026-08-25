import { Field, ObjectType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { Role } from "../../../../../../core/enums/user/role.enum";

@ObjectType()
export class MessageSender {
    @Field()
    userId: string;
}