import { CreateJobWorkSpaceUseCase } from './CreateJobWorkSpaceUseCase';
import JobRepository from '../../data_layer/JobRepository';

jest.mock('../../data_layer', () => ({
  getDatabase: () => jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({
      returning: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(null),
      }),
    }),
  }),
}));

jest.mock('../../lib/parser/Settings/loadSettingsFromDatabase', () => ({
  loadSettingsFromDatabase: jest.fn().mockResolvedValue({
    pageEmoji: 'first_emoji',
  }),
}));

beforeAll(() => {
  process.env.WORKSPACE_BASE = '/tmp/test-workspace';
});

describe('CreateJobWorkSpaceUseCase', () => {
  const mockJobRepository = {
    updateJobStatus: jest.fn().mockResolvedValue(true),
  } as unknown as JobRepository;

  const mockApi = {} as any;

  it('sets useAll to true when isPaying is true', async () => {
    const useCase = new CreateJobWorkSpaceUseCase(mockJobRepository);

    const result = await useCase.execute({
      id: 'test-id',
      owner: 'test-owner',
      api: mockApi,
      jobRepository: mockJobRepository,
      isPaying: true,
    });

    expect(result.bl.useAll).toBe(true);
  });

  it('sets useAll to false when isPaying is false', async () => {
    const useCase = new CreateJobWorkSpaceUseCase(mockJobRepository);

    const result = await useCase.execute({
      id: 'test-id',
      owner: 'test-owner',
      api: mockApi,
      jobRepository: mockJobRepository,
      isPaying: false,
    });

    expect(result.bl.useAll).toBe(false);
  });
});
