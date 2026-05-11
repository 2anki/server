import JobRepository from '../../data_layer/JobRepository';
import Jobs from '../../data_layer/public/Jobs';

export class CompleteJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(jobId: string, owner: string): Promise<Jobs> {
    const job = await this.jobRepository.findJobById(jobId, owner);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'cancelled') {
      return job;
    }

    return this.jobRepository.updateJobStatus(jobId, owner, 'done');
  }
}
