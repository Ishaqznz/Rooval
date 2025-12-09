import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { IUserResponseDTO } from 'src/application/DTO/user/signup/singup.response.dto';
import { IUserUseCase } from '../interface/user.usecase.interface';
import { UserOutputMapper } from 'src/application/mapper/user/user.output.mapper';
import { IFindUsersRequestDTO } from 'src/application/DTO/user/findUsers/findUsers.request.dto';
import { UserQueryParams } from 'src/core/entities/user/userQueryParams.entity';
import { ICountUsersRequestDTO } from 'src/application/DTO/user/countUsers/countUsers.request.dto';
import { CountUsers } from 'src/core/entities/user/countUsers.entity';
import { UserErrorType } from 'src/core/enums/user.enums';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
  ) { }

  async findUsers(input: IFindUsersRequestDTO): Promise<IUserResponseDTO[]> {
    const entity = UserQueryParams.fromRequest(input)
    const users = await this._userRepository.findUsers(entity);
    return UserOutputMapper.toUsersDTO(users);
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
}
