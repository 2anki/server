import { S3 } from 'aws-sdk';
import StorageHandler from '../lib/storage/StorageHandler';
import DownloadRepository from '../data_layer/DownloadRepository';

class DownloadService {
  constructor(private downloadRepository: DownloadRepository) {}

  async getFileBody(
    owner: string,
    key: string,
    storage: StorageHandler
  ): Promise<S3.Body | null | undefined> {
    const fileEntry = await this.downloadRepository.getFile(owner, key);
    if (!fileEntry) {
      return null;
    }
    const file = await storage.getFileContents(fileEntry.key);
    return file?.Body;
  }

  isValidKey(key: string) {
    return key && key.length > 0;
  }

  isMissingDownloadError(error: unknown) {
    const errorName = (error as AWS.AWSError)?.name;
    return errorName?.match(/NoSuchKey/);
  }

  deleteMissingFile(owner: string, key: string) {
    this.downloadRepository.deleteMissingFile(owner, key);
  }
}

export default DownloadService;
