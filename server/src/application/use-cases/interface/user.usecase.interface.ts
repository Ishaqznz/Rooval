import { ICountUsersRequestDTO } from "src/application/dto/user/request/countUsers.request.dto"
import { IFindUsersRequestDTO } from "src/application/dto/user/request/findUsers.request.dto"
import { IUserResponseDTO } from "src/application/dto/auth/response/singup.response.dto"
import { IUpdateProfilePhotoDTO } from "src/application/dto/user/request/updateProfilePhoto.request.dto"
import { IUpdateProfileRequestDTO } from "src/application/dto/user/request/udpateProfile.input"
import { Role } from "src/core/enums/user/role.enum"

export interface IUserUseCase {
    findUsers(input: IFindUsersRequestDTO): Promise<IUserResponseDTO[]>
    findAllUsers(): Promise<IUserResponseDTO[]>
    countUsers(input: ICountUsersRequestDTO): Promise<number>
    findById(userId: string): Promise<IUserResponseDTO>
    findByIds(userIds: string[]): Promise<IUserResponseDTO[]>
    findByEmail(email: string): Promise<IUserResponseDTO>
    changeUserStatus(userId: string, status: boolean): Promise<boolean>
    deleteUser(userId: string): Promise<boolean>
    updateProfilePhoto(file: IUpdateProfilePhotoDTO): Promise<string>
    updateProfile(input: IUpdateProfileRequestDTO): Promise<boolean>
    findByRole(id: string): Promise<Role>
    findAdminId(): Promise<string | null>
}