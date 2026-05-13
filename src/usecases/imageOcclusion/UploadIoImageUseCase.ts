import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import StorageHandler from '../../lib/storage/StorageHandler';

export interface UploadIoImageInput {
  userId: number;
  filePath: string;
  originalName: string;
  mimeType: string;
}

export class UploadIoImageUseCase {
  private readonly storage: StorageHandler;
  constructor(storage?: StorageHandler) { this.storage = storage ?? new StorageHandler(); }

  async execute(input: UploadIoImageInput): Promise<{ s3Key: string; presignedUrl: string }> {
    const ext = path.extname(input.originalName) || '.jpg';
    const s3Key = `io-drafts/${input.userId}/${randomUUID()}${ext}`;
    await this.storage.uploadFile(s3Key, fs.readFileSync(input.filePath));
    const presignedUrl = await this.storage.getPresignedUrl(s3Key);
    return { s3Key, presignedUrl };
  }
}
