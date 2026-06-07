import { Role } from "src/core/enums/user/role.enum";
import { IUserProfile } from "src/core/interfaces/user/profile.interface";

export interface IUserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  profile: IUserProfile
  isAdmin: boolean;
  isBlocked: boolean;
  password: string;
  createdAt?: Date
  updatedAt?: Date
}
