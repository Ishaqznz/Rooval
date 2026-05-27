import { Role } from "src/core/enums/user/role.enum";

export class RoleEntity {
    constructor(
        public readonly role: Role
    ) {}

    static create(role: Role) {
        return new RoleEntity(role)
    }
}