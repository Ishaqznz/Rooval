import { InputType, Field } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { StatusFilter } from "../../../../../../core/enums/user/user.enums";
import { RoleFilter } from "../../../../../../core/enums/user/user.enums";
import { AuthFilter } from "../../../../../../core/enums/user/user.enums";
import { SortField } from "../../../../../../core/enums/user/user.enums";
import { SortOrder } from "../../../../../../core/enums/user/user.enums";

@InputType()
export class FindUsersInput {
    @Field()
    @IsNumber()
    page: number

    @Field()
    @IsNumber()
    limit: number

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string

    @Field(() => StatusFilter, { nullable: true })
    @IsOptional()
    @IsEnum(StatusFilter)
    filter?: StatusFilter

    @Field(() => RoleFilter, { nullable: true })
    @IsOptional()
    @IsEnum(RoleFilter)
    role?: RoleFilter

    @Field(() => AuthFilter, { nullable: true })
    @IsOptional()
    @IsEnum(AuthFilter)
    authMethod?: AuthFilter

    @Field(() => SortField, { nullable: true })
    @IsOptional()
    @IsEnum(SortField)
    sortBy?: SortField

    @Field(() => SortOrder, { nullable: true })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder
}