import JobRepository from '../../data_layer/JobRepository';

export class CheckInProgressJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(id: string, owner: string): Promise<boolean> {
    const job = await this.jobRepository.findJobById(id, owner);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'started') {
      return true;
    }

    return job.status === 'failed';
  }
}
