import { FileUpload } from "graphql-upload-ts";

export interface ISupaBaseService {
    uploadFile(file: FileUpload, folder: string): Promise<string>;
    uploadBaseFile(file: string, folder: string): Promise<string>
    uploadRawFile(file: FileUpload, folder: string): Promise<string>
    fileToBase64(file: FileUpload): Promise<string>
}