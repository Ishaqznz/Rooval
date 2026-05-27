import { InputType, Field } from "@nestjs/graphql";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PaginationInput } from "./pagination.input";
import { DoctorSortInput } from "./sorting.input";
import { DoctorFilterInput } from "./filter.input";

@InputType()
export class ListDoctorsInput {
  @Field(() => PaginationInput)
  @ValidateNested()
  @Type(() => PaginationInput)
  pagination: PaginationInput;

  @Field(() => DoctorSortInput)
  @ValidateNested()
  @Type(() => DoctorSortInput)
  sorting: DoctorSortInput;

  @Field(() => DoctorFilterInput)
  @ValidateNested()
  @Type(() => DoctorFilterInput)
  filter: DoctorFilterInput;
}
