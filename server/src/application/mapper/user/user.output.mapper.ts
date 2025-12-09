import { IUserResponseDTO } from "src/application/DTO/user/signup/singup.response.dto";
import { User } from "src/core/entities/user/user.entity";

export class UserOutputMapper {
    static toUserDTO(entity: User): IUserResponseDTO {
        const userOutputDto = {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            role: entity.role,
            isAdmin: entity.isAdmin,
            isBlocked: entity.isBlocked,
            password: entity.password,
        }
        return userOutputDto;
    }

    static toUsersDTO(entities: User[]): IUserResponseDTO[] {
        return entities.map((entity) => this.toUserDTO(entity));
    }
}