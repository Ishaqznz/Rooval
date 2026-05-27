import { Field, ObjectType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { Role } from "src/core/enums/user/role.enum";

@ObjectType()
export class ConversationParticipantsModel {
    @Field()
    userId: string

    @Field(() => Role)
    @IsEnum(Role)
    role: Role
}