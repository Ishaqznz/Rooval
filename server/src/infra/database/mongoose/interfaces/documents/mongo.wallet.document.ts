import { Role } from "src/core/enums/user/role.enum";

export interface IMongoWalletDocument {
    _id: string;
    ownerId: string;
    ownerType: Role;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: Date
    updatedAt: Date
    __v: number
}