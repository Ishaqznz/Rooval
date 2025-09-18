import { UserEntity } from '../../../core/entities/user.entity';
import { SignUpOutputDto } from '../../DTO/user/signup/singup.output.dto';
import { LoginInputDto } from '../../DTO/user/login/login.input.dto';
import { PasswordInputDto } from '../../DTO/user/forgotPassword/forgot-passwords.input.dto';

export interface IAuthRepository {
  findUsers(): Promise<SignUpOutputDto[]>;
  createUser(data: UserEntity): Promise<SignUpOutputDto>;
  loginUser(data: LoginInputDto): Promise<SignUpOutputDto>;
  userExists(email: string): Promise<boolean>;
  verifyEmail(token: string): Promise<SignUpOutputDto>;
  forgotPassword(userData: PasswordInputDto): Promise<boolean>;
  verifyResetToken(token: string): Promise<SignUpOutputDto>;
  resetPassword(password: string, userId: string): Promise<SignUpOutputDto>;
}
