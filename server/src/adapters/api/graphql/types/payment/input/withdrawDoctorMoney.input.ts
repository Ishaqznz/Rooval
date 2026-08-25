import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@InputType()
export class WithdrawDoctorMoneyInput {
    @Field()
    @IsNumber()
    amount: number;

    @Field()
    @IsString()
    accountHolderName: string;

    @Field()
    @IsNumber()
    accountNumber: number;

    @Field()
    @IsString()
    bankName: string;

    @Field()
    @IsString()
    ifscCode: string;

    @Field()
    @IsString()
    @IsOptional()
    notes?: string;
}