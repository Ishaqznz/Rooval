import { FileUpload } from "graphql-upload-ts"

export interface IUpdateProfilePhotoDTO {
    profilePhoto: FileUpload,
    userId: string
}