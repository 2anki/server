import JobRepository from '../../data_layer/JobRepository';

interface CheckJobLimitUseCaseInput {
  owner: string;
  maxJobs: number;
}

export class CheckJobLimitUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(input: CheckJobLimitUseCaseInput): Promise<boolean> {
    const { owner, maxJobs } = input;

    const jobs = await this.jobRepository.getJobsByOwner(owner);

    return jobs.length <= maxJobs;
  }
}
