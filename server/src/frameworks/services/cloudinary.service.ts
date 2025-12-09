import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import { ICloudinaryService } from "src/application/services/cloudinary.service.interface";

@Injectable()
export class CloudinaryService implements ICloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: FileUpload, folder: string): Promise<string> {
    const { createReadStream, filename } = file;
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const cloudStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      stream.pipe(cloudStream);
    });
  }
}
