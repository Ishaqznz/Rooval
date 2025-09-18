import { Inject, Injectable } from '@nestjs/common';
import { SignUpOutputDto } from '../DTO/user/signup/singup.output.dto';
import { IUserRepository } from '../repositories/user/user.repository.interface';

@Injectable()
export class UserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,
  ) {}

  findById(userId: string): Promise<SignUpOutputDto> {
    return this._userRepository.findById(userId);
  }

  findByEmail(email: string): Promise<SignUpOutputDto> {
    return this._userRepository.findByEmail(email);
  }

  async changeUserStatus(userId: string, status: boolean): Promise<boolean> {
    return this._userRepository.updateStatus(userId, status);
  }
}
