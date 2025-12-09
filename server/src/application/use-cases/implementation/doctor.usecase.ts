import { Inject, Injectable } from '@nestjs/common';
import { IDoctorRepository } from 'src/core/repositories/doctor.repository.interface';
import { IDoctorResponseDTO } from 'src/application/DTO/doctor/login/login.response.dto';
import { IDoctorUseCase } from '../interface/doctor.usecase.interface';
import { DoctorOutputMapper } from 'src/application/mapper/doctor/doctor.output.mapper';
import { IDoctorOnboardingRequestDTo } from 'src/application/DTO/doctor/onboarding/onboarding.request';
import { DoctorInputMapper } from 'src/application/mapper/doctor/doctor.input.mapper';
import { IFileUploadDTO } from 'src/application/DTO/doctor/fileupload/file.request.dto';
import { FileUploadInputMapper } from 'src/application/mapper/doctor/fileupload.input.mapper';
import { IFileReUploadDTO } from 'src/application/DTO/doctor/file-reupload/file-reupload.request.dto';
import { FileReUploadInputMapper } from 'src/application/mapper/doctor/file-reupload.input.mapper';
import { IFindDoctorsRequestDTO } from 'src/application/DTO/doctor/findDoctors/findDoctors.request.dto';
import { DoctorQueryParams } from 'src/core/entities/doctor/doctorQueryParams.entity';
import { ICloudinaryService } from 'src/application/services/cloudinary.service.interface';
import { IRejectionReasonRequestDTO } from 'src/application/DTO/doctor/rejectionReason/rejectionReason.request.dto';
import { ICountDoctorsRequestDTO } from 'src/application/DTO/doctor/countDoctors/countDoctors.request.dto';
import { CountDoctors } from 'src/core/entities/doctor/countDoctors.entity';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { UserErrorType } from 'src/core/enums/user.enums';

@Injectable()
export class DoctorUseCase implements IDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly _doctorRepository: IDoctorRepository,
    @Inject('ICloudinaryService')
    private readonly _cloudinaryService: ICloudinaryService
  ) { }

  async findDoctors(input: IFindDoctorsRequestDTO): Promise<IDoctorResponseDTO[]> {
    const entity = DoctorQueryParams.fromRequest(input)
    const doctorEntities = await this._doctorRepository.findDoctors(entity)
    return DoctorOutputMapper.toDoctorsDTO(doctorEntities);
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

  async doctorOnboarding(onboardingData: IDoctorOnboardingRequestDTo): Promise<boolean> {
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
}
