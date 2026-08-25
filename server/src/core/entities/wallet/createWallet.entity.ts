import { Role } from "../../enums/user/role.enum";

export class CreateWallet {
    constructor(
        public readonly input: {
            userId: string,
            role: Role
        }
    ) {}

    static create(input: {
        userId: string
        role: Role
    }): CreateWallet {
        return new CreateWallet(input)
    }
}