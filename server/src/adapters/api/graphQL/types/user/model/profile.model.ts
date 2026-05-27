import { Field, ObjectType } from "@nestjs/graphql";
import { UserPersonalInfo } from "./personal.model";
import { Health } from "./health.model";


@ObjectType()
export class UserProfile {
    @Field(() => UserPersonalInfo)
    personal: UserPersonalInfo

    @Field(() => Health)
    health: Health
}
