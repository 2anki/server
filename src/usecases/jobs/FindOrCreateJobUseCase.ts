import JobRepository from '../../data_layer/JobRepository';
import { CreateJobUseCase } from './CreateJobUseCase';
import Jobs from '../../data_layer/public/Jobs';

interface FindOrCreateJobUseCaseInput {
  id: string;
  owner: string;
  title: string;
  type: string;
}

export class FindOrCreateJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(input: FindOrCreateJobUseCaseInput): Promise<Jobs> {
    const { id, owner, title, type } = input;

    // Check if the job already exists
    const existingJob = await this.jobRepository.findJobById(id, owner);
    if (existingJob) {
      return existingJob;
    }

    const createJob = new CreateJobUseCase(this.jobRepository);
    await createJob.execute({
      id,
      owner,
      title,
      type,
    });

    const secondLookup = await this.jobRepository.findJobById(id, owner);
    if (!secondLookup) {
      throw new Error('Failed to find or create job after creation attempt');
    }
    return secondLookup;
  }
}
