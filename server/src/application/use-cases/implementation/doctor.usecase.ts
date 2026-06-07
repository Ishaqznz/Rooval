import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from 'src/core/repositories/doctor.repository.interface';
import { IDoctorResponseDTO } from 'src/application/dto/auth/response/login.response.dto';
import { IDoctorUseCase } from '../interface/doctor.usecase.interface';
import { DoctorOutputMapper } from 'src/application/mapper/doctor/profile/doctor.output.mapper';
import { IDoctorOnboardingRequestDTO } from 'src/application/dto/doctor/profile/request/onboarding.request';
import { DoctorInputMapper } from 'src/application/mapper/doctor/profile/doctor.input.mapper';
import { IFileUploadDTO } from 'src/application/dto/doctor/profile/request/file.request.dto';
import { FileUploadInputMapper } from 'src/application/mapper/doctor/profile/fileupload.input.mapper';
import { IFileReUploadDTO } from 'src/application/dto/doctor/profile/request/file-reupload.request.dto';
import { FileReUploadInputMapper } from 'src/application/mapper/doctor/profile/file-reupload.input.mapper';
import { IFindDoctorsRequestDTO } from 'src/application/dto/doctor/profile/request/findDoctors.request.dto';
import { DoctorQueryParams } from 'src/core/entities/doctor/profile/doctorQueryParams.entity';
import { ICloudinaryService } from 'src/application/services/cloudinary.service.interface';
import { IRejectionReasonRequestDTO } from 'src/application/dto/doctor/profile/request/rejectionReason.request.dto';
import { ICountDoctorsRequestDTO } from 'src/application/dto/doctor/profile/request/countDoctors.request.dto';
import { CountDoctors } from 'src/core/entities/doctor/profile/countDoctors.entity';
import { BusinessRuleViolationError } from 'src/core/errors/businessRule.error';
import { UserErrorType } from 'src/core/enums/user/user.enums';
import { IUpdateProfileRequestDTO } from 'src/application/dto/doctor/profile/request/updateProfile.request.dto';
import { IChangePasswordRequestDTO } from 'src/application/dto/auth/request/changePassword.request';
import { DoctorErrorType } from 'src/core/enums/doctor/doctor.enums';
import { IDoctorService } from 'src/application/services/doctor.service.interface';
import { ChangePasswordInputMapper } from 'src/application/mapper/doctor/profile/changePassword.input.mapper';
import { ChangeDoctorPassord } from 'src/core/entities/doctor/profile/changeDoctorPassword.entity';
import { IListDoctorsRequestDTO } from 'src/application/dto/doctor/profile/request/listDoctors.request.dto';
import { ListDoctors } from 'src/core/entities/doctor/profile/listDoctors.entity';
import { IListDoctorsResponseDTO } from 'src/application/dto/doctor/profile/response/listDoctors.response.dto';
import { IGrantChatAccessRequestDTO } from 'src/application/dto/doctor/profile/request/grantChatAccess.request.dto';
import { GrantChatAccess } from 'src/core/entities/doctor/profile/grantChatAccess.entity';
import { IRemoveChatAccessRequestDTO } from 'src/application/dto/doctor/profile/request/removeChatAccess.request.dto';
import { RemoveChatAccess } from 'src/core/entities/doctor/profile/removeChatAccess.entity';
import { IReviewsUseCase } from '../interface/reviews.usecase.interface';
import { IDoctorDashboardResponseDTO } from 'src/application/dto/doctor/dashboard/response/doctorDashboard.response.dto';
import { IAppointmentUseCase } from '../interface/appointment.usecase.interface';
import { AppointmentStatus } from 'src/core/enums/appointments/appointment.enums';
import { IWalletUseCase } from '../interface/wallet.usecase.interface';
import { ListTransactionType, WalletTransactionType } from 'src/core/enums/wallet/wallet.enum';

@Injectable()
export class DoctorUseCase implements IDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository,

    @Inject('ICloudinaryService')
    private readonly _cloudinaryService: ICloudinaryService,

    @Inject('IDoctorService')
    private readonly _doctorService: IDoctorService,

    @Inject('IReviewsUseCase')
    private readonly _reviewsUseCase: IReviewsUseCase,

    @Inject('IAppointmentUseCase')
    private readonly _appointmentUseCase: IAppointmentUseCase,

    @Inject('IWalletUseCase')
    private readonly _walletUseCase: IWalletUseCase
  ) { }

  async findDoctors(input: IFindDoctorsRequestDTO): Promise<IDoctorResponseDTO[]> {
    const entity = DoctorQueryParams.fromRequest(input)
    const doctorEntities = await this._doctorRepository.findDoctors(entity)
    return DoctorOutputMapper.toDoctorsDTO(doctorEntities);
  }

  async findAllDoctors(): Promise<IDoctorResponseDTO[]> {
    return DoctorOutputMapper.toDoctorsDTO(
      await this._doctorRepository.findAllDoctors()
    );
  }

  async countDoctors(input: ICountDoctorsRequestDTO): Promise<number> {
    const entity = CountDoctors.create(input.search, input.status)
    if (!entity.ok) throw new BusinessRuleViolationError(UserErrorType.ValidationFailed)
    return this._doctorRepository.countDoctors(entity.value)
  }

  async findById(userId: string): Promise<IDoctorResponseDTO> {
    const doctorEntity = await this._doctorRepository.findById(userId);
    return DoctorOutputMapper.toDoctorDTO(doctorEntity);
  }

  async findByIds(doctorIds: string[]): Promise<IDoctorResponseDTO[]> {
    const doctors = await this._doctorRepository.findByIds(doctorIds)
    return DoctorOutputMapper.toDoctorsDTO(doctors)
  }

  async findByEmail(email: string): Promise<IDoctorResponseDTO> {
    const doctorEntity = await this._doctorRepository.findByEmail(email)
    return DoctorOutputMapper.toDoctorDTO(doctorEntity);
  }

  async findByUsername(username: string): Promise<IDoctorResponseDTO> {
    const doctorEntity = await this._doctorRepository.findByUsername(username)
    return DoctorOutputMapper.toDoctorDTO(doctorEntity)
  }

  async changeDoctorStatus(userId: string, status: string): Promise<boolean> {
    return await this._doctorRepository.changeDoctorStatus(userId, status)
  }

  async deleteDoctor(userId: string): Promise<boolean> {
    return await this._doctorRepository.deleteDoctor(userId)
  }

  async doctorOnboarding(onboardingData: IDoctorOnboardingRequestDTO): Promise<boolean> {
    const props = DoctorInputMapper.toOnboardingEntity({ ...onboardingData })
    return await this._doctorRepository.addOnboarding(props);
  }

  async doctorFileUpload(files: IFileUploadDTO, doctorId: string): Promise<boolean> {
    const profilePhoto = await files.profilePhoto;
    const certificates = await Promise.all(files.certificates);
    const profilePhotoUrl = await this._cloudinaryService.uploadFile(profilePhoto, 'doctors/profile');
    const certificateUrls: string[] = [];

    for (const cert of certificates) {
      const url = await this._cloudinaryService.uploadFile(cert, 'doctors/certificates');
      certificateUrls.push(url);
    }

    const entity = FileUploadInputMapper.toFileUploadEntity(profilePhotoUrl, certificateUrls, doctorId)
    return this._doctorRepository.doctorFileUpload(entity)
  }

  async fileReUpload(files: IFileReUploadDTO, doctorId: string): Promise<boolean> {
    const certificates = await Promise.all(files.certificates);
    const certificateUrls: string[] = [];

    for (const cert of certificates) {
      const url = await this._cloudinaryService.uploadFile(cert, 'doctors/certificates');
      certificateUrls.push(url);
    }

    const entity = FileReUploadInputMapper.toFileUploadEntity(certificateUrls, doctorId)
    return this._doctorRepository.doctorFileReUpload(entity)
  }

  async addRejectionReason(input: IRejectionReasonRequestDTO): Promise<boolean> {
    return this._doctorRepository.addRejectionReason(input.doctorId, input.rejectionReason)
  }

  async updateProfile(userid: string, input: IUpdateProfileRequestDTO): Promise<boolean> {
    const entity = DoctorInputMapper.toUpdateProfileEntity(input);
    return this._doctorRepository.updateProfile(userid, entity)
  }

  async changePassword(userId: string, input: IChangePasswordRequestDTO): Promise<boolean> {
    const doctor = await this._doctorRepository.findById(userId)
    if (!doctor) {
      throw new BusinessRuleViolationError(DoctorErrorType.DoctorNotFound)
    }

    const checkPassword = await this._doctorService.comparePassword(input.oldPassword, doctor.password);
    if (!checkPassword) {
      throw new BusinessRuleViolationError(DoctorErrorType.PasswordMismatch)
    }

    const passEntity = ChangePasswordInputMapper.toChangePasswordEntity(userId, input.newPassword)
    if (typeof passEntity == 'string') throw new BusinessRuleViolationError(passEntity)
    const hashedPassword = await this._doctorService.hashPassword(input.newPassword)
    const hashedPassEntity = ChangePasswordInputMapper.toChangePasswordEntity(userId, hashedPassword)
    return this._doctorRepository.changePassword(hashedPassEntity as ChangeDoctorPassord)
  }

  async listDoctors(input: IListDoctorsRequestDTO): Promise<IListDoctorsResponseDTO> {
    const entity = ListDoctors.create(input)
    if (entity.ok == false) throw new BusinessRuleViolationError(entity.error)
    const doctorEntities = await this._doctorRepository.listDoctors(entity.value)
    console.log('the list doctors count: ', doctorEntities, doctorEntities[0]?.doctorsCount)
    return DoctorOutputMapper.toListDoctorsDTO(doctorEntities, doctorEntities[0]?.doctorsCount);
  }

  async getById(doctorId: string): Promise<IDoctorResponseDTO> {
    const entity = await this._doctorRepository.findById(doctorId)
    return DoctorOutputMapper.toDoctorDTO(entity)
  }

  async grantChatAccess(input: IGrantChatAccessRequestDTO): Promise<boolean> {
    const entity = GrantChatAccess.create(input)
    return await this._doctorRepository.grantChatAccess(entity)
  }

  async removeChatAccess(input: IRemoveChatAccessRequestDTO): Promise<boolean> {
    const entity = RemoveChatAccess.create(input)
    return this._doctorRepository.removeChatAccess(entity)
  }

  async getAverageRating(doctorId: string): Promise<number> {
    const reviews = await this._reviewsUseCase.getReviewsByDoctorId(doctorId);

    if (!reviews.length) {
      return 0;
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return totalRating / reviews.length;
  }

  async getDoctorDashboard(
    doctorId: string
  ): Promise<IDoctorDashboardResponseDTO> {
    const doctorWallet = await this._walletUseCase.getWallet({ ownerId: doctorId })
    const [appointments, reviews, wallet, transactionData] =
      await Promise.all([
        await this._appointmentUseCase.findDoctorAppointments(doctorId),
        this._reviewsUseCase.getReviewsByDoctorId(doctorId),
        doctorWallet,
        this._walletUseCase.listTransactions({
          walletId: doctorWallet.id,
          page: 1,
          limit: 10000,
          type: ListTransactionType.ALL
        }),
      ]);

    const transactions = transactionData.transactions;

    const today = new Date();

    const todayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(
        appointment.createdAt
      );

      return (
        appointmentDate.getFullYear() === today.getFullYear() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getDate() === today.getDate()
      );
    });

    const completedAppointments = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED
    ).length;

    const cancelledAppointments = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.CANCELLED
    ).length;

    const upcomingAppointments = appointments.filter(
      (appointment) => {
        const appointmentDate = new Date(
          appointment.createdAt
        );

        return (
          appointmentDate > today &&
          appointment.status !== AppointmentStatus.CANCELLED
        );
      }
    ).length;

    const uniquePatients = new Set(
      appointments.map(
        (appointment) => appointment.patientId
      )
    );

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    const recentReviews = [...reviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    const creditTransactions = transactions.filter(
      (transaction) =>
        transaction.type === WalletTransactionType.CREDIT
    );

    const totalRevenue = creditTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const todayRevenue = creditTransactions
      .filter((transaction) => {
        const transactionDate = new Date(
          transaction.createdAt
        );

        return (
          transactionDate.getFullYear() ===
          today.getFullYear() &&
          transactionDate.getMonth() ===
          today.getMonth() &&
          transactionDate.getDate() ===
          today.getDate()
        );
      })
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

    const monthlyRevenue = creditTransactions
      .filter((transaction) => {
        const transactionDate = new Date(
          transaction.createdAt
        );

        return (
          transactionDate.getFullYear() ===
          today.getFullYear() &&
          transactionDate.getMonth() ===
          today.getMonth()
        );
      })
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

    return {
      stats: {
        totalPatients: uniquePatients.size,
        totalAppointments: appointments.length,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      },

      ratings: {
        averageRating: Number(
          averageRating.toFixed(1)
        ),
        totalReviews: reviews.length,
      },

      revenue: {
        availableBalance: wallet.balance,
        todayRevenue,
        monthlyRevenue,
        totalRevenue,
      },

      todayAppointments,

      recentReviews,
    };
  }
}