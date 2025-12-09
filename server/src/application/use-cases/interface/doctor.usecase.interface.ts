import { ICountDoctorsRequestDTO } from "src/application/DTO/doctor/countDoctors/countDoctors.request.dto"
import { IFileReUploadDTO } from "src/application/DTO/doctor/file-reupload/file-reupload.request.dto"
import { IFileUploadDTO } from "src/application/DTO/doctor/fileupload/file.request.dto"
import { IFindDoctorsRequestDTO } from "src/application/DTO/doctor/findDoctors/findDoctors.request.dto"
import { IDoctorResponseDTO } from "src/application/DTO/doctor/login/login.response.dto"
import { IDoctorOnboardingRequestDTo } from "src/application/DTO/doctor/onboarding/onboarding.request"
import { IRejectionReasonRequestDTO } from "src/application/DTO/doctor/rejectionReason/rejectionReason.request.dto"

export interface IDoctorUseCase {
    findDoctors(input: IFindDoctorsRequestDTO): Promise<IDoctorResponseDTO[]>
    countDoctors(input: ICountDoctorsRequestDTO): Promise<number>
    findById(userId: string): Promise<IDoctorResponseDTO>
    findByEmail(email: string): Promise<IDoctorResponseDTO>
    findByUsername(username: string): Promise<IDoctorResponseDTO>
    changeDoctorStatus(userId: string, status: string): Promise<boolean>
    deleteDoctor(userId: string): Promise<boolean>
    doctorOnboarding(onboardingData: IDoctorOnboardingRequestDTo): Promise<boolean>
    doctorFileUpload(files: IFileUploadDTO, doctorId: string): Promise<boolean>
    fileReUpload(files: IFileReUploadDTO, doctorId: string): Promise<boolean>
    addRejectionReason(input: IRejectionReasonRequestDTO): Promise<boolean>
}