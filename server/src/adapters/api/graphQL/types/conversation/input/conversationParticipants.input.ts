import { Field } from "@nestjs/graphql"
import { InputType } from "@nestjs/graphql"

@InputType()
export class ConversationParticipants {
    @Field()
    userId: string
}