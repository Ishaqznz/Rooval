import { User } from "../../../core/entities/user/user.entity";
import { ICreateUserRequestDTO } from "../../dto/auth/request/signup.request.dto";

export class UserInputMapper {
    static toUserEntity(user: ICreateUserRequestDTO): User | string {
        const inputUserEntity = User.create(user.fullName, user.email, user.password, '1', user.role)
        if (inputUserEntity.ok == true) return inputUserEntity.value;
        return inputUserEntity.error
    }
}
