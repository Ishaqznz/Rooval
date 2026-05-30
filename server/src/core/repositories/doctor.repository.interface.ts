import { CountDoctors } from "../entities/doctor/profile/countDoctors.entity"
import { DoctorProfileUpdate } from "../entities/doctor/profile/updateProfile.entity"
import { ChangeDoctorPassord } from "../entities/doctor/profile/changeDoctorPassword.entity"
import { DoctorOnboarding } from "../entities/doctor/profile/onboarding.entity"
import { DoctorQueryParams } from "../entities/doctor/profile/doctorQueryParams.entity"
import { Doctor } from "../entities/doctor/profile/doctor.entity"
import { FileUpload } from "../entities/doctor/profile/fileupload.entity"
import { FileReUpload } from "../entities/doctor/profile/file-reupload.entity"
import { ListDoctors } from "../entities/doctor/profile/listDoctors.entity"
import { ListDoctorsPayload } from "../entities/doctor/profile/listDoctorsPayload.entity"
import { IsChatEnabled } from "../entities/user/isChatEnabled.entity"
import { GrantChatAccess } from "../entities/doctor/profile/grantChatAccess.entity"

export interface IDoctorRepository {
    findDoctors(entity: DoctorQueryParams): Promise<Doctor[]>
    findAllDoctors(): Promise<Doctor[]>
    countDoctors(input: CountDoctors): Promise<number>
    findByEmail(email: string): Promise<Doctor>
    findById(id: string): Promise<Doctor>
    findByIds(ids: string[]): Promise<Doctor[]>
    findByUsername(username: string): Promise<Doctor>
    changeDoctorStatus(doctorId: string, status: string): Promise<boolean>
    deleteDoctor(doctorId: string): Promise<boolean>
    addOnboarding(entity: DoctorOnboarding): Promise<boolean>
    doctorFileUpload(entity: FileUpload): Promise<boolean>
    doctorFileReUpload(entity: FileReUpload): Promise<boolean>
    addRejectionReason(doctorId: string, reason: string): Promise<boolean>
    updateProfile(userId: string, entity: DoctorProfileUpdate): Promise<boolean>
    changePassword(entitity: ChangeDoctorPassord): Promise<boolean>
    listDoctors(entity: ListDoctors): Promise<ListDoctorsPayload[]>
    isChatEnabled(entity: IsChatEnabled): Promise<boolean>
    grantChatAccess(entitity: GrantChatAccess): Promise<boolean>
}