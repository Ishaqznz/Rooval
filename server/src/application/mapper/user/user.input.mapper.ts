import { User } from "src/core/entities/user/user.entity";
import { ICreateUserRequestDTO } from "src/application/DTO/user/signup/signup.request.dto";

export class UserInputMapper {
    static toUserEntity(user: ICreateUserRequestDTO): User | string {
        const inputUserEntity = User.create(user.fullName, user.email, user.password, '1', user.role)
        if (inputUserEntity.ok == true) return inputUserEntity.value;
        return inputUserEntity.error
    }
}
