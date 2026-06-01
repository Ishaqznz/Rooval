import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsString, IsEnum } from 'class-validator';
import { Role } from 'src/core/enums/user/role.enum';

@InputType()
export class SignUpInput {
  @Field()
  @MinLength(3)
  fullName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => Role)
  @IsEnum(Role)
  role: Role

  @Field()
  @MinLength(6)
  password: string;
}
