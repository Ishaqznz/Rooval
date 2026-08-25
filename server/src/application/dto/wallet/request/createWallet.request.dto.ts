import { Role } from "../../../../core/enums/user/role.enum"

export interface ICreateWalletRequestDTO {
    userId: string
    role: Role
}