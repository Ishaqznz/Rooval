import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class GetWalletInput {
    @Field()
    ownerId: string;
}