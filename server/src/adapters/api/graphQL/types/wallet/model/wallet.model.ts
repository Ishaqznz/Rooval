import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { Role } from "src/core/enums/user/role.enum";

@ObjectType()
export class Wallet {
    @Field(() => ID)
    id: string;

    @Field()
    ownerId: string;

    @Field(() => Role)
    @IsEnum(Role)
    ownerType: Role;

    @Field()
    balance: number;

    @Field()
    currency: string;

    @Field()
    isActive: boolean;
}