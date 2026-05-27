import { FileReUpload } from "src/core/entities/doctor/profile/file-reupload.entity"

export class FileReUploadInputMapper {
    static toFileUploadEntity(certificates: string[], doctorId: string): FileReUpload {
        return FileReUpload.create(certificates, doctorId)
    }
}