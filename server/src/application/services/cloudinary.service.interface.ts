import { FileUpload } from "graphql-upload/processRequest.mjs";

export interface ICloudinaryService {
  uploadFile(file: FileUpload, folder: string): Promise<string>;
}
