import { FileReUpload } from "src/core/entities/doctor/file-reupload.entity"

export class FileReUploadInputMapper {
    static toFileUploadEntity(certificates: string[], doctorId: string): FileReUpload {
        return FileReUpload.create(certificates, doctorId)
    }
}