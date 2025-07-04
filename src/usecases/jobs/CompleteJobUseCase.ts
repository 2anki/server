import JobRepository from '../../data_layer/JobRepository';

export class CompleteJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(jobId: string, owner: string): Promise<number> {
    const job = await this.jobRepository.findJobById(jobId, owner);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'cancelled') {
      return job;
    }

    return this.jobRepository.deleteJob(jobId, owner);
  }
}
