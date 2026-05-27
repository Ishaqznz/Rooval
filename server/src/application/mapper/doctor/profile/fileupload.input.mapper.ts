import { FileUpload } from "src/core/entities/doctor/profile/fileupload.entity";

export class FileUploadInputMapper {
    static toFileUploadEntity(profilePhoto: string, certificates: string[], doctorId: string): FileUpload {
        return FileUpload.create(profilePhoto, certificates, doctorId)
    }
}