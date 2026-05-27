import { IUserProfile } from "src/core/interfaces/user/profile.interface";

export interface IUserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profile: IUserProfile
  isAdmin: boolean;
  isBlocked: boolean;
  password: string;
}
