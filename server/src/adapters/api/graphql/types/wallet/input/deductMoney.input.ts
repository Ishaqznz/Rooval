import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class DeductMoneyInput {
    @Field()
    walletId: string;

    @Field()
    amount: number;
}