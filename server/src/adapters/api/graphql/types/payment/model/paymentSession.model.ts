import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PaymentSession {
    @Field()
    url: string
}