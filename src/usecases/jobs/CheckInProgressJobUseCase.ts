import JobRepository from '../../data_layer/JobRepository';

const RESTARTABLE_STATUSES = new Set([
  'started',
  'failed',
  'done',
  'interrupted',
]);

export class CheckInProgressJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(id: string, owner: string): Promise<boolean> {
    const job = await this.jobRepository.findJobById(id, owner);
    if (!job) {
      throw new Error('Job not found');
    }

    return RESTARTABLE_STATUSES.has(job.status);
  }
}
