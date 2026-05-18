import JobService from '../../services/JobService';
import UploadService from '../../services/UploadService';

class DeleteJobUseCase {
  constructor(
    private readonly jobService: JobService,
    private readonly uploadService: UploadService
  ) {}

  async execute(jobId: string, owner: string): Promise<void> {
    const deleted = await this.jobService.deleteJobById(jobId, owner);
    if (deleted?.download_key) {
      await this.uploadService.deleteUpload(
        Number(owner),
        deleted.download_key
      );
    }
  }
}

export default DeleteJobUseCase;
