import UploadRepository from '../data_layer/UploadRespository';
import { BytesToMegaBytes } from '../lib/misc/file';
import StorageHandler from '../lib/storage/StorageHandler';
import { UploadedFile } from '../lib/storage/types';

class UploadService {
  getUploadsByOwner(owner: number) {
    return this.uploadRepository.getUploadsByOwner(owner);
  }

  constructor(private readonly uploadRepository: UploadRepository) {}

  async deleteUpload(owner: number, key: string) {
    const s = new StorageHandler();
    await this.uploadRepository.deleteUpload(owner, key);
    await s.delete(key);
  }

  registerUploadSize(file: UploadedFile, owner?: number) {
    const { originalname, key, size } = file;

    if (!owner) {
      return;
    }

    return this.uploadRepository.update(
      owner,
      originalname,
      key,
      BytesToMegaBytes(size)
    );
  }
}

export default UploadService;
