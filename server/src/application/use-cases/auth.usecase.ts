import { IAuthRepository } from '../repositories/auth/auth.repository.interface.';
import { IAuthService } from '../services/auth.service';
import { SignUpOutputDto } from '../DTO/user/signup/singup.output.dto';
import { SignUpInputDto } from '../DTO/user/signup/signup.input.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { LoginInputDto } from '../DTO/user/login/login.input.dto';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import { PasswordInputDto } from '../DTO/user/forgotPassword/forgot-passwords.input.dto';
import { IDoctorRepository } from '../repositories/doctor/doctor.repository.interface';
import { DoctorOutputDto } from '../DTO/doctor/login/login.output.dto';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly _authRepository: IAuthRepository,

    @Inject('IAuthService') 
    private readonly _authService: IAuthService,

    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository
  ) { }

  async findUsers(): Promise<SignUpOutputDto[]> {
    return await this._authRepository.findUsers();
  }
  async signUp(input: SignUpInputDto): Promise<SignUpOutputDto> {
    const user = await this._authRepository.userExists(input.email);
    if (user) throw new BusinessRuleViolationError('User Already exists!');
    const hashedPassword = await this._authService.hashPassword(input.password);
    const userEntity = UserEntity.create(
      input.fullName,
      input.email,
      input.role,
      hashedPassword,
    );
    return this._authRepository.createUser(userEntity);
  }

  async verifyEmail(token: string): Promise<SignUpOutputDto> {
    return this._authRepository.verifyEmail(token);
  }

  async generateJwt(userId: string, role: string): Promise<string> {
    return this._authService.genrateJwt(userId, role);
  }

  async login(userData: LoginInputDto): Promise<SignUpOutputDto | DoctorOutputDto> {
    const user = await this._userRepository.findByEmail(userData.email);
    const doctor = await this._doctorRepository.findByEmail(userData.email);
    
    const account = user || doctor;
    if (!account) {
      throw new BusinessRuleViolationError('No account found with this email!');
    }

    if ("isBlocked" in account && account.isBlocked) {
      throw new BusinessRuleViolationError("Account is blocked by the admin!");
    }

    const checkPassword = await this._authService.comparePassword(
      userData.password,
      account.password,
    );
    if (!checkPassword) {
      throw new BusinessRuleViolationError('Password mismatch!');
    }

    return account; 
  }


  async forgotPassword(input: PasswordInputDto): Promise<boolean> {
    const userExists = await this._authRepository.userExists(input.email);
    if (!userExists) return false;
    return this._authRepository.forgotPassword(input);
  }

  async verifyResetToken(token: string): Promise<SignUpOutputDto> {
    return this._authRepository.verifyResetToken(token);
  }

  async verifyResetPassword(
    password: string,
    userId: string,
  ): Promise<SignUpOutputDto> {
    const hashedPassword = await this._authService.hashPassword(password);
    return this._authRepository.resetPassword(hashedPassword, userId);
  }

  async adminLogin(userData: LoginInputDto): Promise<SignUpOutputDto> {
    const userDatas = await this._userRepository.findByEmail(userData.email);
    if (!userDatas.isAdmin) throw new BusinessRuleViolationError('user is not an admin!')
    if (userDatas.isBlocked) throw new BusinessRuleViolationError('User is blocked by the admin!')
    const checkPassword = await this._authService.comparePassword(
      userData.password,
      userDatas.password,
    );
    if (!checkPassword) {
      throw new BusinessRuleViolationError('Password mismatch!');
    }
    return userDatas;
  }
}
