import { Role } from "src/core/enums/user/role.enum";

export interface IWalletResponseDTO {
    id: string;
    ownerId: string;
    ownerType: Role;
    balance: number;
    currency: string;
    isActive: boolean;
}