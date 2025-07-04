import JobRepository from '../../data_layer/JobRepository';
import Jobs from '../../data_layer/public/Jobs';

interface StartJobUseCaseInput {
  id: string;
  owner: string;
}

export class StartJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(input: StartJobUseCaseInput): Promise<Jobs> {
    const { id, owner } = input;
    const job = await this.jobRepository.findJobById(id, owner);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'cancelled') {
      return job;
    }

    return this.jobRepository.updateJobStatus(id, owner, 'started', '');
  }
}
