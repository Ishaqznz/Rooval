import { Role } from "src/core/enums/user/role.enum";

export interface ICreateUserRequestDTO {
  fullName: string;
  email: string;
  role: Role
  password: string;
}
