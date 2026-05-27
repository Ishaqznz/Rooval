import { CountUsers } from "src/core/entities/user/countUsers.entity";
import { User } from "src/core/entities/user/user.entity";
import { UserQueryParams } from "src/core/entities/user/userQueryParams.entity";
import { ProfilePhoto } from "../entities/user/profilePhoto.entity";
import { UserProfileUpdate } from "../entities/user/updateProfile.entity";
import { Role } from "../enums/user/role.enum";
import { RoleEntity } from "../entities/user/role.entity";

export interface IUserRepository {
  findUsers(input: UserQueryParams): Promise<User[]>
  findAllUsers(): Promise<User[]>
  countUsers(input: CountUsers): Promise<number>
  findById(userId: string): Promise<User>;
  findByIds(userIds: string[]): Promise<User[]>
  findByEmail(email: string): Promise<User>;
  updateStatus(userId: string, status: boolean): Promise<boolean>
  deleteUser(userId: string): Promise<boolean>
  updateProfilePhoto(input: ProfilePhoto): Promise<string>
  updateProfile(entity: UserProfileUpdate): Promise<boolean>
  findRoleById(id: string): Promise<RoleEntity>
  findAdminId(): Promise<string | null>
}
