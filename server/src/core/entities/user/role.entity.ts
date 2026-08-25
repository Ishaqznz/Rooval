import { Role } from "../../enums/user/role.enum";

export class RoleEntity {
    constructor(
        public readonly role: Role
    ) {}

    static create(role: Role) {
        return new RoleEntity(role)
    }
}