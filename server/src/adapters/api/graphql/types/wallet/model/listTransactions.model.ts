import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Transaction } from "./transaction.model";

@ObjectType()
export class ListTransactions {
    @Field(() => [Transaction])
    transactions: Transaction[]

    @Field(() => Int)
    totalTransactions: number
}