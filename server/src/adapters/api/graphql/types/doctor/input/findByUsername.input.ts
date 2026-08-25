import { InputType, Field } from "@nestjs/graphql";
import { Min } from "class-validator";

@InputType()
export class FindByUsernameInput {
    @Field()
    @Min(3)
    Username: string
}