import { Role } from "src/core/enums/user/role.enum"

export interface ICreateWalletRequestDTO {
    userId: string
    role: Role
}