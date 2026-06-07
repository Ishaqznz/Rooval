import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Review {
    @Field()
    id: string

    @Field()
    doctorId: string

    @Field()
    patientId: string

    @Field()
    appointmentId: string

    @Field()
    rating: number

    @Field()
    review: string

    @Field()
    isVisible: boolean

    @Field()
    createdAt: Date
    
    @Field()
    updatedAt: Date
}