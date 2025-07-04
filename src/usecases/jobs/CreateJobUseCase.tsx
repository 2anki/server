import JobRepository from '../../data_layer/JobRepository';

export interface CreateJobUseCaseIn {
  id: string;
  owner: string;
  title?: string | null;
  type?: string;
}

export class CreateJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(input: CreateJobUseCaseIn): Promise<number> {
    const { id, owner, title, type } = input;
    const result = await this.jobRepository.create(id, owner, title, type);
    if (result.length === 0) {
      throw new Error('Failed to create job');
    }
    return result[0];
  }
}
