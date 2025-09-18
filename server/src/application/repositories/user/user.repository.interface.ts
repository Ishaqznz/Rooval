import { SignUpOutputDto } from '../../DTO/user/signup/singup.output.dto';

export interface IUserRepository {
  findById(userId: string): Promise<SignUpOutputDto>;
  findByEmail(email: string): Promise<SignUpOutputDto>;
  updateStatus(userId: string, status: boolean): Promise<boolean>
  deleteUser(userId: string): Promise<boolean>
}
