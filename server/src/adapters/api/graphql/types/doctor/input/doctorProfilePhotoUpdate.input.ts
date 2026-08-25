import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class DoctorProfilePhotoUpdateInput {
    @Field(() => GraphQLUpload)
    @IsOptional()
    profilePhoto: FileUpload;
}