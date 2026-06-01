import { Field, InputType } from "@nestjs/graphql";
import { Role } from "src/core/enums/user/role.enum";

@InputType()
export class CreateWalletInput {
    @Field()
    userId: string;

    @Field(() => Role)
    role: Role;
}