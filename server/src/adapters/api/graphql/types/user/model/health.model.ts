import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Health {
    @Field(() => [String], { nullable: true })
    allergies?: string[]

    @Field(() => [String], { nullable: true })
    currentMedication?: string[]

    @Field({ nullable: true })
    preferredLanguage?: string
}