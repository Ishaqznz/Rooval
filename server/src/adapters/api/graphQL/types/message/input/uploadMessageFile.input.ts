import { Field, InputType } from "@nestjs/graphql";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";
import { IsNotEmpty } from "class-validator";

@InputType()
export class UploadMessageFileInput {
    @Field(() => GraphQLUpload)
    @IsNotEmpty()
    file: FileUpload
}   