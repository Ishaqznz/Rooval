import { ICountUsersRequestDTO } from "src/application/DTO/user/countUsers/countUsers.request.dto"
import { IFindUsersRequestDTO } from "src/application/DTO/user/findUsers/findUsers.request.dto"
import { IUserResponseDTO } from "src/application/DTO/user/signup/singup.response.dto"

export interface IUserUseCase {
    findUsers(input: IFindUsersRequestDTO): Promise<IUserResponseDTO[]>
    countUsers(input: ICountUsersRequestDTO): Promise<number>
    findById(userId: string): Promise<IUserResponseDTO>
    findByEmail(email: string): Promise<IUserResponseDTO>
    changeUserStatus(userId: string, status: boolean): Promise<boolean>
    deleteUser(userId: string): Promise<boolean>
}