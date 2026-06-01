import { IAuthRepository } from 'src/core/repositories/auth.repository.interface.';
import { IAuthService } from 'src/application/services/auth.service.interface';
import { ICreateUserRequestDTO } from '../../dto/auth/request/signup.request.dto';
import { User } from 'src/core/entities/user/user.entity';
import { Doctor } from 'src/core/entities/doctor/profile/doctor.entity';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationError } from 'src/core/errors/businessRule.error';
import { IUserLoginRequestDTO } from 'src/application/dto/auth/request/login.request.dto';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { IUserPasswordRequestDTO } from 'src/application/dto/auth/request/forgot-passwords.request.dto';
import { IDoctorRepository } from '../../../core/repositories/doctor.repository.interface';
import { IDoctorResponseDTO } from '../../dto/auth/response/login.response.dto';
import { IAuthUseCase } from '../interface/auth.usecase.interface';
import { IUserResponseDTO } from 'src/application/dto/auth/response/singup.response.dto';
import { UserInputMapper } from 'src/application/mapper/user/user.input.mapper';
import { UserOutputMapper } from 'src/application/mapper/user/user.output.mapper';
import { DoctorOutputMapper } from 'src/application/mapper/doctor/profile/doctor.output.mapper';
import { UserErrorType } from 'src/core/enums/user/user.enums';
import { IGoogleLoginRequestDTO } from 'src/application/dto/auth/request/googleLogin.request.dto';
import { GoogleLogin } from 'src/core/entities/user/googleLogin.entity';
import { INotificationOrchestrator } from 'src/application/orchestrators/interface/notification.orch.interface';
import { NotificationMessages, NotificationType } from 'src/core/enums/notifications/notification.enum';
import { IWalletUseCase } from '../interface/wallet.usecase.interface';
import { Role } from 'src/core/enums/user/role.enum';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly _authRepository: IAuthRepository,

    @Inject('IAuthService')
    private readonly _authService: IAuthService,

    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository,

    @Inject('INotificationOrchestrator')
    private readonly _notificationOrchestrator: INotificationOrchestrator,

    @Inject('IWalletUseCase')
    private readonly _walletUseCase: IWalletUseCase
  ) { }

  async signUp(input: ICreateUserRequestDTO): Promise<IUserResponseDTO> {
    const user = await this._authRepository.userExists(input.email);
    const doctor = await this._doctorRepository.findByEmail(input.email)
    if (user) throw new BusinessRuleViolationError(UserErrorType.UserAlreadyExists);
    if (doctor) throw new BusinessRuleViolationError(UserErrorType.UserAlreadyExists)

    const password = await this._authService.hashPassword(input.password);

    const inputUserEntity = UserInputMapper.toUserEntity({ ...input, password })
    if (typeof inputUserEntity == 'string') throw new BusinessRuleViolationError(inputUserEntity)

    const outputUserEntity = await this._authRepository.createUser(inputUserEntity);
    const userOutputDto = UserOutputMapper.toUserDTO(outputUserEntity);
    return userOutputDto
  }

  async verifyEmail(token: string): Promise<IUserResponseDTO | IDoctorResponseDTO> {
    const entity = await this._authRepository.verifyEmail(token)

    await this._walletUseCase.createWallet({
      userId: entity.id,
      role: entity.role
    })
    
    const adminId = await this._userRepository.findAdminId();
    
    await this._notificationOrchestrator.notify({
      receiverId: adminId,
      content: NotificationMessages.NEW_USER_CREATED,
      isRead: false,
      type: NotificationType.SYSTEM
    })

    if (entity.role == 'user') {
      return UserOutputMapper.toUserDTO(entity as User)
    }
    return DoctorOutputMapper.toDoctorDTO(entity as Doctor)
  }

  async generateJwt(userId: string, role: string): Promise<string> {
    return this._authService.genrateJwt(userId, role);
  }

  async generateRefreshToken(userId: string, role: string): Promise<string> {
    return this._authService.generateRefreshToken(userId, role);
  }

  async login(input: IUserLoginRequestDTO): Promise<IUserResponseDTO | IDoctorResponseDTO> {
    const user = await this._userRepository.findByEmail(input.email);
    const doctor = await this._doctorRepository.findByEmail(input.email)
    if (!user && !doctor) {
      throw new BusinessRuleViolationError(UserErrorType.NoAccountFound);
    }

    if (user && user.isBlocked) {
      throw new BusinessRuleViolationError(UserErrorType.UserBlocked)
    }

    if (user?.isAdmin) {
      throw new BusinessRuleViolationError(UserErrorType.USER_HAVE_NO_ACCESS)
    }

    const account = user ?? doctor;
    const isDoctor = Boolean(doctor);

    const checkPassword = await this._authService.comparePassword(
      input.password,
      account.password,
    );

    if (!checkPassword) {
      throw new BusinessRuleViolationError(UserErrorType.PasswordMismatch);
    }
    if (isDoctor) {
      return DoctorOutputMapper.toDoctorDTO(doctor)
    }
    return UserOutputMapper.toUserDTO(user);
  }


  async forgotPassword(input: IUserPasswordRequestDTO): Promise<boolean> {
    const userExists = await this._authRepository.userExists(input.email);
    const doctorExists = await this._doctorRepository.findByEmail(input.email)
    if (!userExists && !doctorExists) return false;
    return this._authRepository.forgotPassword(input.email);
  }

  async verifyResetToken(token: string): Promise<IUserResponseDTO> {
    const entitity = await this._authRepository.verifyResetToken(token);
    return UserOutputMapper.toUserDTO(entitity as User)
  }

  async verifyResetPassword(
    password: string,
    userId: string,
  ): Promise<IUserResponseDTO | IDoctorResponseDTO> {
    const hashedPassword = await this._authService.hashPassword(password);
    const entity = await this._authRepository.resetPassword(hashedPassword, userId);
    if (entity.role == 'user') {
      return UserOutputMapper.toUserDTO(entity as User)
    }
    return DoctorOutputMapper.toDoctorDTO(entity as Doctor)
  }

  async adminLogin(userData: IUserLoginRequestDTO): Promise<IUserResponseDTO> {
    const userDatas = await this._userRepository.findByEmail(userData.email);
    if (!userDatas) throw new BusinessRuleViolationError(UserErrorType.NoAccountFound)
    if (!userDatas.isAdmin) throw new BusinessRuleViolationError(UserErrorType.UserIsNotAnAdmin)
    if (userDatas.isBlocked) throw new BusinessRuleViolationError(UserErrorType.UserBlocked)
    const checkPassword = await this._authService.comparePassword(
      userData.password,
      userDatas.password,
    );
    if (!checkPassword) {
      throw new BusinessRuleViolationError(UserErrorType.PasswordMismatch);
    }
    return userDatas;
  }

  async refreshTokens(refreshToken: string): Promise<string> {
    return this._authService.rotateAccessToken(refreshToken)
  }

  async loginWithGoogle(input: IGoogleLoginRequestDTO): Promise<IUserResponseDTO | IDoctorResponseDTO> {
    const entitity = GoogleLogin.create(input.fullName, input.email, input.googleId, input.role)

    if (!entitity.ok) {
      throw new BusinessRuleViolationError(UserErrorType.ValidationFailed);
    }
    const userEntity = await this._authRepository.googleLogin(entitity.value);
    if (userEntity)
      if (userEntity.role == 'user') {
        return UserOutputMapper.toUserDTO(userEntity as User)
      }

    return DoctorOutputMapper.toDoctorDTO(userEntity as Doctor)
  }
}