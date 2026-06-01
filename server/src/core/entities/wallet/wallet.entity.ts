import { Role } from "src/core/enums/user/role.enum"

export class Wallet {
    constructor(
        public readonly input: {
            id: string
            ownerId: string
            ownerType: Role
            balance: number
            currency: string
            isActive: boolean
        }
    ) { }

    static create(input: {
        id: string
        ownerId: string
        ownerType: Role
        balance: number
        currency: string
        isActive: boolean
    }): Wallet {
        return new Wallet(input)
    }
}