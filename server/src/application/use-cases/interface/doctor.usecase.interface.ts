import { IChangePasswordRequestDTO } from "src/application/dto/auth/request/changePassword.request"
import { ICountDoctorsRequestDTO } from "src/application/dto/doctor/profile/request/countDoctors.request.dto"
import { IFileReUploadDTO } from "src/application/dto/doctor/profile/request/file-reupload.request.dto"
import { IFileUploadDTO } from "src/application/dto/doctor/profile/request/file.request.dto"
import { IFindDoctorsRequestDTO } from "src/application/dto/doctor/profile/request/findDoctors.request.dto"
import { IDoctorResponseDTO } from "src/application/dto/auth/response/login.response.dto"
import { IDoctorOnboardingRequestDTO } from "src/application/dto/doctor/profile/request/onboarding.request"
import { IRejectionReasonRequestDTO } from "src/application/dto/doctor/profile/request/rejectionReason.request.dto"
import { IUpdateProfileRequestDTO } from "src/application/dto/doctor/profile/request/updateProfile.request.dto"
import { IListDoctorsRequestDTO } from "src/application/dto/doctor/profile/request/listDoctors.request.dto"
import { IListDoctorsResponseDTO } from "src/application/dto/doctor/profile/response/listDoctors.response.dto"
import { IGrantChatAccessRequestDTO } from "src/application/dto/doctor/profile/request/grantChatAccess.request.dto"
import { IRemoveChatAccessRequestDTO } from "src/application/dto/doctor/profile/request/removeChatAccess.request.dto"
import { IDoctorDashboardResponseDTO } from "src/application/dto/doctor/dashboard/response/doctorDashboard.response.dto"

export interface IDoctorUseCase {
    findDoctors(input: IFindDoctorsRequestDTO): Promise<IDoctorResponseDTO[]>
    findAllDoctors(): Promise<IDoctorResponseDTO[]>
    countDoctors(input: ICountDoctorsRequestDTO): Promise<number>
    findById(userId: string): Promise<IDoctorResponseDTO>
    findByIds(doctorIds: string[]): Promise<IDoctorResponseDTO[]>
    findByEmail(email: string): Promise<IDoctorResponseDTO>
    findByUsername(username: string): Promise<IDoctorResponseDTO>
    changeDoctorStatus(userId: string, status: string): Promise<boolean>
    deleteDoctor(userId: string): Promise<boolean>
    doctorOnboarding(onboardingData: IDoctorOnboardingRequestDTO): Promise<boolean>
    doctorFileUpload(files: IFileUploadDTO, doctorId: string): Promise<boolean>
    fileReUpload(files: IFileReUploadDTO, doctorId: string): Promise<boolean>
    addRejectionReason(input: IRejectionReasonRequestDTO): Promise<boolean>
    updateProfile(userId: string, input: IUpdateProfileRequestDTO): Promise<boolean>
    changePassword(userId: string, input: IChangePasswordRequestDTO): Promise<boolean>
    listDoctors(input: IListDoctorsRequestDTO): Promise<IListDoctorsResponseDTO>
    getById(doctorId: string): Promise<IDoctorResponseDTO>
    grantChatAccess(input: IGrantChatAccessRequestDTO): Promise<boolean>
    removeChatAccess(input: IRemoveChatAccessRequestDTO): Promise<boolean>
    getAverageRating(doctorId: string): Promise<number>
    getDoctorDashboard(doctorId: string): Promise<IDoctorDashboardResponseDTO>
}

