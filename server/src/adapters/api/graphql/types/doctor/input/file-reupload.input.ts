import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { IsOptional } from 'class-validator';

@InputType()
export class DoctorFileUpdateInput {
  
  @Field(() => [GraphQLUpload])
  @IsOptional()
  certificates: FileUpload[];
}
