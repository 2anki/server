import JobRepository from '../../data_layer/JobRepository';

export class SetJobFailedUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(id: string, owner: string, reason: string): Promise<void> {
    const job = await this.jobRepository.findJobById(id, owner);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'failed') {
      return;
    }

    await this.jobRepository.updateJobStatus(id, owner, 'failed', reason);
  }
}
