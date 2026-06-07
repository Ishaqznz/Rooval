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
import { IAdminDashboardResponseDTO } from 'src/application/dto/user/response/adminDashboard.response.dto';
import { IDoctorUseCase } from '../interface/doctor.usecase.interface';
import { IAppointmentUseCase } from '../interface/appointment.usecase.interface';
import { IWalletUseCase } from '../interface/wallet.usecase.interface';
import { DoctorStatusFilter } from 'src/core/enums/doctor/doctor.enums';
import { AppointmentStatus } from 'src/core/enums/appointments/appointment.enums';
import { WalletTransactionType } from 'src/core/enums/wallet/wallet.enum';

@Injectable()
export class UserUseCase implements IUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly _userRepository: IUserRepository,

    @Inject('ICloudinaryService')
    private readonly _cloudinaryService: ICloudinaryService,

    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository,

    @Inject('IDoctorUseCase')
    private readonly _doctorUseCase: IDoctorUseCase,

    @Inject('IAppointmentUseCase')
    private readonly _appointmentUseCase: IAppointmentUseCase,

    @Inject('IWalletUseCase')
    private readonly _walletUseCase: IWalletUseCase
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

  async getDashboardData(): Promise<IAdminDashboardResponseDTO> {
    const [
      users,
      doctors,
      appointments,
      transactions,
    ] = await Promise.all([
      this.findAllUsers(),
      this._doctorUseCase.findAllDoctors(),
      this._appointmentUseCase.findAllAppointments(),
      this._walletUseCase.findAllTransactions(),
    ]);

    const approvedDoctors = doctors.filter(
      doctor => doctor.status === DoctorStatusFilter.APPROVED
    ).length;

    const pendingDoctors = doctors.filter(
      doctor => doctor.status === DoctorStatusFilter.PENDING
    ).length;

    const rejectedDoctors = doctors.filter(
      doctor => doctor.status === DoctorStatusFilter.REJECTED
    ).length;

    const completedAppointments = appointments.filter(
      appointment =>
        appointment.status === AppointmentStatus.COMPLETED
    ).length;

    const cancelledAppointments = appointments.filter(
      appointment =>
        appointment.status === AppointmentStatus.CANCELLED
    ).length;

    const recentAppointments = [...appointments]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const recentlyRegisteredDoctors = [...doctors]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const recentlyRegisteredUsers = [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const commissionPercentage =
      Number(process.env.PLATFORM_COMMISSION) || 20;

    const today = new Date();

    const creditTransactions = transactions.filter(
      transaction =>
        transaction.type === WalletTransactionType.CREDIT
    );

    const totalRevenue = creditTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const todayRevenue = creditTransactions
      .filter(transaction => {
        const date = new Date(transaction.createdAt);

        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
        );
      })
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

    const monthlyRevenue = creditTransactions
      .filter(transaction => {
        const date = new Date(transaction.createdAt);

        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth()
        );
      })
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

    const doctorPayouts =
      totalRevenue *
      ((100 - commissionPercentage) / 100);

    const platformProfit =
      totalRevenue *
      (commissionPercentage / 100);

    return {
      stats: {
        totalUsers: users.length,
        totalDoctors: doctors.length,
        approvedDoctors,
        pendingDoctors,
        rejectedDoctors,
        totalAppointments: appointments.length,
        completedAppointments,
        cancelledAppointments,
      },

      revenue: {
        todayRevenue,
        monthlyRevenue,
        totalRevenue,
        doctorPayouts,
        platformProfit,
      },

      recentAppointments,

      recentlyRegisteredDoctors,

      recentlyRegisteredUsers,
    };
  }
}