import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from '../repositories/doctor/doctor.repository.interface';
import { DoctorOutputDto } from '../DTO/doctor/login/login.output.dto';

@Injectable()
export class DoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository,
  ) {}

  async findDoctors(): Promise<DoctorOutputDto[]> {
    return await this._doctorRepository.findAll()
  }

  async findById(userId: string): Promise<DoctorOutputDto> {
    return await this._doctorRepository.findById(userId);
  }

  async findByEmail(email: string): Promise<DoctorOutputDto> {
    return await this._doctorRepository.findByEmail(email);
  }

}
