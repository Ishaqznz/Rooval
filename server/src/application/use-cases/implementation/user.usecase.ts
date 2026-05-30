import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { IUserResponseDTO } from 'src/application/dto/auth/response/singup.response.dto';
import { IUserUseCase } from '../interface/user.usecase.interface';
import { UserOutputMapper } from 'src/application/mapper/user/user.output.mapper';
import { IFindUsersRequestDTO } from 'src/application/dto/user/request/findUsers.request.dto';
import { UserQueryParams } from 'src/core/entities/user/userQueryParams.entity';
import { ICountUsersRequestDTO } from 'src/application/dto/user/request/countUsers.request.dto';
import { CountUsers } from 'src/core/entities/user/countUsers.entity';
import { UserErrorType } from 'src/core/enums/user/user.enums';
import { IUpdateProfilePhotoDTO } from 'src/application/dto/user/request/updateProfilePhoto.request.dto';
import { ICloudinaryService } from 'src/application/services/cloudinary.service.interface';
import { ProfilePhotoInputMapper } from 'src/application/mapper/user/profilePhoto.input.mapper';
import { IUpdateProfileRequestDTO } from 'src/application/dto/user/request/udpateProfile.input';
import { UserProfileUpdate } from 'src/core/entities/user/updateProfile.entity';
import { Role } from 'src/core/enums/user/role.enum';
import { IChatEnabledRequestDTO } from 'src/application/dto/user/request/isChatEnabled.request.dto';
import { IsChatEnabled } from 'src/core/entities/user/isChatEnabled.entity';
import { IDoctorRepository } from 'src/core/repositories/doctor.repository.interface';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('ICloudinaryService')
    private readonly _cloudinaryService: ICloudinaryService,

    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository
  ) { }

  async findUsers(input: IFindUsersRequestDTO): Promise<IUserResponseDTO[]> {
    const entity = UserQueryParams.fromRequest(input)
    const users = await this._userRepository.findUsers(entity);
    return UserOutputMapper.toUsersDTO(users);
  }

  async findAllUsers(): Promise<IUserResponseDTO[]> {
    const users = await this._userRepository.findAllUsers()
    return UserOutputMapper.toUsersDTO(users)
  }

  async countUsers(input: ICountUsersRequestDTO): Promise<number> {
    const entity = CountUsers.create(input.search, input.status)
    if (!entity.ok) throw new Error(UserErrorType.ValidationFailed)
    return this._userRepository.countUsers(entity.value)
  }

  async findById(userId: string): Promise<IUserResponseDTO> {
    const userEntity = await this._userRepository.findById(userId);
    const userOutputDto = UserOutputMapper.toUserDTO(userEntity);
    return userOutputDto;
  }

  async findByIds(userIds: string[]): Promise<IUserResponseDTO[]> {
    const entities = await this._userRepository.findByIds(userIds)
    return UserOutputMapper.toUsersDTO(entities)
  }

  async findByEmail(email: string): Promise<IUserResponseDTO> {
    const userEntity = await this._userRepository.findByEmail(email)
    const userOutputDto = UserOutputMapper.toUserDTO(userEntity)
    return userOutputDto
  }

  async changeUserStatus(userId: string, status: boolean): Promise<boolean> {
    return await this._userRepository.updateStatus(userId, status);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return await this._userRepository.deleteUser(userId)
  }

  async updateProfilePhoto(input: IUpdateProfilePhotoDTO): Promise<string> {
    const file = await input.profilePhoto;
    const url = await this._cloudinaryService.uploadFile(file, 'users/profilePhoto')
    const entity = ProfilePhotoInputMapper.toProfilePhotoEntity(url, input.userId)
    return await this._userRepository.updateProfilePhoto(entity)
  }

  async updateProfile(input: IUpdateProfileRequestDTO): Promise<boolean> {
    const entity = UserProfileUpdate.create(input);
    return this._userRepository.updateProfile(entity)
  }

  async findByRole(id: string): Promise<Role> {
    return (await this._userRepository.findRoleById(id)).role
  }

  async findAdminId(): Promise<string | null> {
    return await this._userRepository.findAdminId()
  }

  async isChatEnabled(input: IChatEnabledRequestDTO): Promise<boolean> {
    const entity = IsChatEnabled.create(input)
    return await this._doctorRepository.isChatEnabled(entity)
  }
}