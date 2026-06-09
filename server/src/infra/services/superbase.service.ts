import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileUpload } from 'graphql-upload-ts';
import { ISupaBaseService } from 'src/application/services/supabase.service.interface';
import { Readable } from 'stream';
import ws from 'ws';

@Injectable()
export class SupabaseService implements ISupaBaseService {
  private supabase: SupabaseClient;
  private bucket = 'messages';

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    this.supabase = createClient(url!, key!, {
      auth: { persistSession: false },
      realtime: { transport: ws },
    });
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async uploadFile(file: FileUpload, folder: string): Promise<string> {
    const { createReadStream, filename, mimetype } = file;
    const buffer = await this.streamToBuffer(createReadStream());
    const filePath = `${folder}/${Date.now()}-${filename}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async uploadRawFile(file: FileUpload, folder: string): Promise<string> {
    const { createReadStream, filename, mimetype } = file;
    const buffer = await this.streamToBuffer(createReadStream());
    const filePath = `${folder}/${Date.now()}-${filename}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async uploadBaseFile(base64File: string, folder: string): Promise<string> {
    const matches = base64File.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 file format');

    const mimetype = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const extension = mimetype.split('/')[1] || 'bin';
    const filePath = `${folder}/${Date.now()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async fileToBase64(file: FileUpload): Promise<string> {
    const { createReadStream, mimetype } = file;
    const buffer = await this.streamToBuffer(createReadStream());
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
  }
}