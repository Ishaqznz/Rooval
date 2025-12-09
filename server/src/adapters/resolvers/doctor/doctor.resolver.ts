import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ChangeDoctorStatusInput } from 'src/adapters/graphQL/types/doctor/changeStatus.input';
import { Doctor } from 'src/adapters/graphQL/types/doctor/doctor.model';
import { DeleteDoctorInput } from 'src/adapters/graphQL/types/doctor/deleteDoctor.input';
import { JwtAdminGuard } from 'src/common/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
import { DoctorOnboardingInput } from 'src/adapters/graphQL/types/doctor/onboarding.input';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { DoctorFileUploadInput } from 'src/adapters/graphQL/types/doctor/fileupload.input';
import { DoctorFileUpdateInput } from 'src/adapters/graphQL/types/doctor/file-reupload.input';
import { findDoctorsInput } from 'src/adapters/graphQL/types/doctor/findDoctors.input';
import { IDoctorUseCase } from 'src/application/use-cases/interface/doctor.usecase.interface';
import { RejectionReasonInput } from 'src/adapters/graphQL/types/doctor/rejectionReason.input';
import { CountDoctorsInput } from 'src/adapters/graphQL/types/doctor/countDoctors.input';
import { GqlContext } from 'src/common/types/gql-context.type';
import { FindByUsernameInput } from 'src/adapters/graphQL/types/doctor/findByUsername.input';

@Injectable()
@Resolver(() => Doctor)
export class DoctorResolver {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
    @Inject('IDoctorUseCase') private readonly _doctorUseCase: IDoctorUseCase,
  ) { }

  @Query(() => Doctor)
  @UseGuards(JwtAuthGuard)
  async findDoctor(
    @Context() context: GqlContext
  ): Promise<Doctor> {
    const userId = context.req.user?.userId;
    return this._doctorUseCase.findById(userId)
  }

  @Query(() => Doctor)
  async findDoctorByUsername(
    @Args('input') input: FindByUsernameInput
  ): Promise<Doctor> {
    return this._doctorUseCase.findByUsername(input.Username)
  }

  @Query(() => [Doctor], { name: 'findDoctors' })
  @UseGuards(JwtAdminGuard)
  async findDoctors(@Args('input') input: findDoctorsInput): Promise<Doctor[]> {
    return await this._doctorUseCase.findDoctors(input);
  }

  @Query(() => Number)
  @UseGuards(JwtAdminGuard)
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
    console.log('the doctor input: ', input)
    const id = context.req.user?.userId;
    return await this._doctorUseCase.doctorOnboarding({ ...input, id })
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async doctorFileUpload(
    @Args('input') input: DoctorFileUploadInput,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const doctorId = context.req.user?.userId;
    return this._doctorUseCase.doctorFileUpload(input, doctorId)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async FileReUpload(
    @Args('input') input: DoctorFileUpdateInput,
    @Context() context: GqlContext
  ): Promise<boolean> {
    const userId = context.req.user?.userId
    return this._doctorUseCase.fileReUpload(input, userId)
  }

  @Mutation(() => Boolean)
  async addRejectionReason(
    @Args('input') input: RejectionReasonInput
  ): Promise<boolean> {
    return this._doctorUseCase.addRejectionReason(input)
  }
} 