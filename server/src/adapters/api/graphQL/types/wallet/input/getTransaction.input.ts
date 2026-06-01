import { Field, InputType, Int } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ListTransactionType } from "src/core/enums/wallet/wallet.enum";

@InputType()
export class GetTransactionsInput {
    @Field()
    @IsString()
    walletId: string;

    @Field(() => ListTransactionType)
    @IsEnum(ListTransactionType)
    type: ListTransactionType

    @Field(() => Int)
    @IsNumber()
    page: number;

    @Field(() => Int)
    @IsNumber()
    limit: number;
}