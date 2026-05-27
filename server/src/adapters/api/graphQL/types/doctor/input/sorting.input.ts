import { InputType, Field } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { DoctorSortBy } from "src/core/enums/doctor/doctor.enums";
import { OrderBy } from "src/core/enums/doctor/doctor.enums";

@InputType()
export class DoctorSortInput {
    @Field(() => DoctorSortBy, { defaultValue: DoctorSortBy.EXPERIENCE })
    @IsEnum(DoctorSortBy)
    sortBy: DoctorSortBy

    @Field(() => OrderBy, { defaultValue: OrderBy.DESC })
    @IsEnum(OrderBy)
    order: OrderBy
}