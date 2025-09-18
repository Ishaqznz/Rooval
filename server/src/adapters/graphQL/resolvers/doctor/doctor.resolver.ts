import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Query, Mutation, Args } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { User } from 'src/adapters/types/user/user.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Doctor } from 'src/adapters/types/doctor/doctor.model';
import { DoctorUseCase } from 'src/application/use-cases/doctor.usecase';

@Injectable()
@Resolver(() => Doctor)
export class DoctoResolver {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
        private readonly _doctorUseCase: DoctorUseCase,
  ) {}

  @Query(() => [User], { name: 'findDoctors' })
  async findDoctors(): Promise<Doctor[]> {
    this._logger.debug('here all the doctor data is actually fetching!')
    return await this._doctorUseCase.findDoctors();
  }
}