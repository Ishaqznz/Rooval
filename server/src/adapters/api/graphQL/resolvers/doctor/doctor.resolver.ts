import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Query, Mutation, Args, Context, ResolveField, Parent, Float } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ChangeDoctorStatusInput } from 'src/adapters/api/graphql/types/doctor/input/changeStatus.input';
import { Doctor } from 'src/adapters/api/graphql/types/doctor/model/doctor.model';
import { DeleteDoctorInput } from 'src/adapters/api/graphql/types/doctor/input/deleteDoctor.input';
import { JwtAdminGuard } from 'src/common/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
import { DoctorOnboardingInput } from 'src/adapters/api/graphql/types/doctor/input/onboarding.input';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { DoctorFileUploadInput } from 'src/adapters/api/graphql/types/doctor/input/fileupload.input';
import { DoctorFileUpdateInput } from 'src/adapters/api/graphql/types/doctor/input/file-reupload.input';
import { FindDoctorsInput } from 'src/adapters/api/graphql/types/doctor/input/findDoctors.input';
import { IDoctorUseCase } from 'src/application/use-cases/interface/doctor.usecase.interface';
import { RejectionReasonInput } from 'src/adapters/api/graphql/types/doctor/input/rejectionReason.input';
import { CountDoctorsInput } from 'src/adapters/api/graphql/types/doctor/input/countDoctors.input';
import { GqlContext } from 'src/common/types/gql-context.type';
import { FindByUsernameInput } from 'src/adapters/api/graphql/types/doctor/input/findByUsername.input';
import { UpdateDoctorProfileInput } from '../../types/doctor/input/updateProfile.input';
import { ChangePasswordInput } from 'src/adapters/api/graphql/types/doctor/input/changePassword.input';
import { DoctorAvailability } from '../../types/availability/model/availability.model';
import { ListDoctorsInput } from '../../types/doctor/input/listDoctors.input';
import { GetDoctorInput } from '../../types/doctor/input/getDoctor.input';
import { ListDoctors } from '../../types/doctor/model/listDoctors.model';
import { Appointment } from '../../types/appointment/model/appointment.model';
import { GetAverageRatingInput } from '../../types/doctor/input/getAverageRating.input';
import { DoctorDashboard } from '../../types/doctor/model/doctorDashboard.model';
import { DoctorProfilePhotoUpdateInput } from '../../types/doctor/input/doctorProfilePhotoUpdate.input';

@Injectable()
@Resolver(() => Doctor)
export class DoctorResolver {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) 
    private readonly _logger: LoggerService,
    @Inject('IDoctorUseCase')
    private readonly _doctorUseCase: IDoctorUseCase,
  ) { }

  @Query(() => Doctor)
  @UseGuards(JwtAuthGuard)
  async findDoctor(
    @Context() context: GqlContext
  ): Promise<Doctor> {
    const userId = context.req.user.userId;
    return this._doctorUseCase.findById(userId)
  }

  @Query(() => [Doctor], { name: 'findDoctors' })
  @UseGuards(JwtAdminGuard)
  async findDoctors(
    @Args('input') input: FindDoctorsInput
  ): Promise<Doctor[]> {
    return await this._doctorUseCase.findDoctors(input);
  }

  @ResolveField(() => [DoctorAvailability])
  @UseGuards(JwtAuthGuard)
  async availabilities(
    @Parent() doctor: Doctor,
    @Context() context: GqlContext
  ): Promise<DoctorAvailability[]> {
    const availabilities = await context.loaders.availability.load(doctor.id)
    return availabilities;
  }

  @ResolveField(() => [Appointment])
  @UseGuards(JwtAuthGuard)
  async appointments(
    @Parent() doctor: Doctor,
    @Context() context: GqlContext 
  ): Promise<Appointment[]> {
    console.log('the parent data: ', doctor)
    const appointments = await context.loaders.appointments.byDoctorId.load(doctor.id)
    console.log('all the appointments in the nested doctor structure: ', appointments)
    return appointments;
  }

  @Query(() => Doctor)
  async findDoctorByUsername(
    @Args('input') input: FindByUsernameInput
  ): Promise<Doctor> {
    return this._doctorUseCase.findByUsername(input.Username)
  }

  @Query(() => Number)
  async countDoctors(@Args('input') input: CountDoctorsInput): Promise<number> {
    return this._doctorUseCase.countDoctors(input);
  }

  @Mutation(() => Boolean, { name: 'changeDoctorStatus' })
  @UseGuards(JwtAdminGuard)
  async changeDoctorStatus(@Args('input') input: ChangeDoctorStatusInput): Promise<boolean> {
    return await this._doctorUseCase.changeDoctorStatus(input.userId, input.status)
  }

  @Mutation(() => Boolean, { name: 'deleteDoctor' })
  @UseGuards(JwtAdminGuard)
  async deleteDoctor(@Args('input') input: DeleteDoctorInput): Promise<boolean> {
    return await this._doctorUseCase.deleteDoctor(input.userId)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async doctorOnboard(
    @Context() context: GqlContext,
    @Args('input') input: DoctorOnboardingInput
  ): Promise<boolean> {
    const id = context.req.user?.userId;
    return await this._doctorUseCase.doctorOnboarding({ ...input, id })
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async doctorFileUpload(
    @Args('input') input: DoctorFileUploadInput,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const doctorId = context.req.user.userId;
    return await this._doctorUseCase.doctorFileUpload(input, doctorId)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async FileReUpload(
    @Args('input') input: DoctorFileUpdateInput,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const userId = context.req.user.userId
    return await this._doctorUseCase.fileReUpload(input, userId)
  }

  @Mutation(() => Boolean)
  async addRejectionReason(
    @Args('input') input: RejectionReasonInput
  ): Promise<boolean> {
    return await this._doctorUseCase.addRejectionReason(input)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async doctorProfileUpdate(
    @Context() context: GqlContext,
    @Args('input') input: UpdateDoctorProfileInput
  ): Promise<boolean> {
    const userId = context.req.user.userId
    return this._doctorUseCase.updateProfile(userId, input)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async doctorChangePassword(
    @Context() context: GqlContext,
    @Args('input') input: ChangePasswordInput
  ): Promise<boolean> {
    const userId = context.req.user.userId
    return this._doctorUseCase.changePassword(userId, input)
  }

  @Query(() => ListDoctors)
  async listDoctors(
    @Args('input', { type: () => ListDoctorsInput }) 
    input: ListDoctorsInput
  ): Promise<ListDoctors> {
    return await this._doctorUseCase.listDoctors(input)
  }

  @Query(() => Doctor)
  async getDoctor(
    @Args('input') input: GetDoctorInput
  ): Promise<Doctor> {
    return this._doctorUseCase.getById(input.doctorId)
  }

  @Query(() => Float)
  async getAverageRating(
    @Args('input') input: GetAverageRatingInput
  ): Promise<number> {
    return await this._doctorUseCase.getAverageRating(input.doctorId)
  }

  @Query(() => DoctorDashboard)
  @UseGuards(JwtAuthGuard)
  async getDoctorDashboardStats(
    @Context() context: GqlContext
  ): Promise<DoctorDashboard> {
    const doctorId = context.req.user.userId;
    const dashboardData = await this._doctorUseCase.getDoctorDashboard(doctorId)
    return dashboardData;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async uploadDoctorProfilePhoto(
    @Args('input') input: DoctorProfilePhotoUpdateInput,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const doctorId = context.req.user.userId;
    return await this._doctorUseCase.uploadProfilePhoto({ ...input, doctorId })
  }
} 