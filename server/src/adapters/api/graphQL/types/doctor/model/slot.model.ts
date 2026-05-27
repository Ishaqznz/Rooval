import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class Slot {
    @Field()
    startTime: Date

    @Field()
    endTime: Date
}
