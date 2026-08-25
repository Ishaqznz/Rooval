import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserPersonalInfo {
    @Field({ nullable: true })
    profilePhoto?: string

    @Field({ nullable: true })
    address?: string

    @Field({ nullable: true })
    phoneNumber?: string

    @Field({ nullable: true })
    gender?: string
}