import { GoogleLogin } from 'src/core/entities/user/googleLogin.entity';
import { Doctor } from '../entities/doctor/doctor.entity';
import { User } from '../entities/user/user.entity';

export interface IAuthRepository {
  createUser(data: User): Promise<User>;
  userExists(email: string): Promise<boolean>;
  verifyEmail(token: string): Promise<User | Doctor>;
  forgotPassword(email: string): Promise<boolean>;
  verifyResetToken(token: string): Promise<User | Doctor>;
  resetPassword(password: string, userId: string): Promise<User | Doctor>;
  googleLogin(data: GoogleLogin): Promise<User | Doctor>
}
