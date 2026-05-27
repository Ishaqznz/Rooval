import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { FileUpload } from "graphql-upload-ts";
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
    const { createReadStream } = file;
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

  async uploadBaseFile(file: string, folder: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder,
      });

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary base64 upload error: ', error);
      throw error;
    }
  }

  async uploadRawFile(file: FileUpload, folder: string): Promise<string> {
    const { createReadStream, filename, mimetype } = file;

    console.log(`[Upload Start] Initializing upload for file: "${filename}" (${mimetype})`);

    const extension = filename.split('.').pop()?.toLowerCase();
    const nameWithoutExtension = filename.split('.').slice(0, -1).join('.');

    const isPdf = extension === 'pdf';
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const cloudStream = cloudinary.uploader.upload_stream(
        {
          folder,
          
          resource_type: isPdf ? 'image' : 'raw',
          public_id: isPdf ? nameWithoutExtension : `${nameWithoutExtension}.${extension}`,

          use_filename: true,
          unique_filename: true,

          flags: 'attachment',
        },
        (error, result) => {
          if (error) {
            console.error('[CLOUDINARY ERROR]:', error);
            return reject(error);
          }

          const finalUrl = result?.secure_url || '';

          console.log('[UPLOAD SUCCESS]: File safely stored!');
          console.log('[NATIVE DOWNLOAD URL]:', finalUrl);

          resolve(finalUrl);
        }
      );

      stream.on('error', (err) => {
        console.error('[INPUT STREAM ERROR]:', err);
        reject(err);
      });

      stream.pipe(cloudStream);
    });
  }

  async fileToBase64(file: FileUpload): Promise<string> {

    const { createReadStream, mimetype } = file;

    const stream = createReadStream();

    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {

        try {

          const buffer = Buffer.concat(chunks);

          const base64 = buffer.toString('base64');

          const base64File =
            `data:${mimetype};base64,${base64}`;

          resolve(base64File);

        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
