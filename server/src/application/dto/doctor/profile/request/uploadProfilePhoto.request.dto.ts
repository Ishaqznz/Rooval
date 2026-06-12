import { FileUpload } from "graphql-upload-ts";

export interface IUploadProfilePhotoInputRequestDTO {
    doctorId: string
    profilePhoto: FileUpload
}