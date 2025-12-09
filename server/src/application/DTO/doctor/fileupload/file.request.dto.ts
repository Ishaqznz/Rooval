import { FileUpload } from "graphql-upload-ts"

export interface IFileUploadDTO {
    profilePhoto: FileUpload
    certificates: FileUpload[]
}