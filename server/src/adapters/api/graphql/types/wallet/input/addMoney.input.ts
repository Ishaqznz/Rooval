import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AddMoneyInput {
    @Field()
    walletId: string;

    @Field()
    amount: number;
}