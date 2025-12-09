import { CountUsers } from "src/core/entities/user/countUsers.entity";
import { User } from "src/core/entities/user/user.entity";
import { UserQueryParams } from "src/core/entities/user/userQueryParams.entity";

export interface IUserRepository {
  findUsers(input: UserQueryParams): Promise<User[]>
  countUsers(input: CountUsers): Promise<number>
  findById(userId: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  updateStatus(userId: string, status: boolean): Promise<boolean>
  deleteUser(userId: string): Promise<boolean>
}
