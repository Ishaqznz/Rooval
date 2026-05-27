import { Field, ObjectType } from "@nestjs/graphql";
import { Personal } from "./personal.model";
import { Clinic } from "./clinic.model";
import { Consultation } from "./consultation.model";

@ObjectType()
export class DoctorProfile {
  @Field(() => Personal, { nullable: true })
  personal?: Personal;

  @Field(() => Clinic, { nullable: true })
  clinic?: Clinic;

  @Field(() => Consultation, { nullable: true })
  consultationSettings?: Consultation;
}