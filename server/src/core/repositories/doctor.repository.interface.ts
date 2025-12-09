import { Doctor } from "src/core/entities/doctor/doctor.entity"
import { DoctorQueryParams } from "src/core/entities/doctor/doctorQueryParams.entity"
import { FileReUpload } from "src/core/entities/doctor/file-reupload.entity"
import { FileUpload } from "src/core/entities/doctor/fileupload.entity"
import { DoctorOnboarding } from "src/core/entities/doctor/onboarding.entity"
import { CountDoctors } from "../entities/doctor/countDoctors.entity"

export interface IDoctorRepository {
    findDoctors(query: DoctorQueryParams): Promise<Doctor[]>
    countDoctors(input: CountDoctors): Promise<number>
    findByEmail(email: string): Promise<Doctor>
    findById(id: string): Promise<Doctor>
    findByUsername(username: string): Promise<Doctor>
    changeDoctorStatus(doctorId: string, status: string): Promise<boolean>
    deleteDoctor(doctorId: string): Promise<boolean>
    addOnboarding(onboardingData: DoctorOnboarding): Promise<boolean>
    doctorFileUpload(files: FileUpload): Promise<boolean>
    doctorFileReUpload(files: FileReUpload): Promise<boolean>
    addRejectionReason(doctorId: string, reason: string): Promise<boolean>
}