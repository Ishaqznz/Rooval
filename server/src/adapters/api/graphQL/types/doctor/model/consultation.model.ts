import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class Consultation {
  @Field({ nullable: true })
  type?: string;

  @Field(() => [String], { nullable: true })
  consultationModes?: string[];

  @Field({ nullable: true })
  consultationFee?: number;

  @Field({ nullable: true })
  inPersonFee?: number; 

  @Field({ nullable: true })
  videoFee?: number; 

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  sessionBufferTime?: string;

  @Field({ nullable: true })
  cancellationPolicy?: string;
}