import { CompleteJobUseCase } from './CompleteJobUseCase';
import JobRepository from '../../data_layer/JobRepository';

describe('CompleteJobUseCase', () => {
  it('marks the job as done instead of deleting it', async () => {
    const updatedJob = {
      id: 1,
      object_id: 'page-1',
      owner: 'user-a',
      status: 'done',
    };

    const jobRepository = {
      findJobById: jest.fn().mockResolvedValue({
        id: 1,
        object_id: 'page-1',
        owner: 'user-a',
        status: 'started',
      }),
      updateJobStatus: jest.fn().mockResolvedValue(updatedJob),
      deleteJob: jest.fn(),
    } as unknown as JobRepository;

    const useCase = new CompleteJobUseCase(jobRepository);
    const result = await useCase.execute('page-1', 'user-a');

    expect(jobRepository.updateJobStatus).toHaveBeenCalledWith(
      'page-1',
      'user-a',
      'done'
    );
    expect(jobRepository.deleteJob).not.toHaveBeenCalled();
    expect(result).toEqual(updatedJob);
  });

  it('returns the job unchanged when already cancelled', async () => {
    const cancelledJob = {
      id: 1,
      object_id: 'page-1',
      owner: 'user-a',
      status: 'cancelled',
    };

    const jobRepository = {
      findJobById: jest.fn().mockResolvedValue(cancelledJob),
      updateJobStatus: jest.fn(),
    } as unknown as JobRepository;

    const useCase = new CompleteJobUseCase(jobRepository);
    const result = await useCase.execute('page-1', 'user-a');

    expect(jobRepository.updateJobStatus).not.toHaveBeenCalled();
    expect(result).toEqual(cancelledJob);
  });

  it('throws when the job does not exist', async () => {
    const jobRepository = {
      findJobById: jest.fn().mockResolvedValue(null),
    } as unknown as JobRepository;

    const useCase = new CompleteJobUseCase(jobRepository);
    await expect(useCase.execute('missing', 'user-a')).rejects.toThrow(
      'Job not found'
    );
  });
});
