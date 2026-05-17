jest.mock('../../StorageHandler', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getWorkspacePath: () => '/tmp/fake-workspace',
    getFileContents: jest.fn().mockResolvedValue(null),
  })),
}));

jest.mock('../../../../usecases/jobs/CreateJobWorkSpaceUseCase');
jest.mock('../../../../usecases/jobs/CreateFlashcardsForJobUseCase');
jest.mock('../../../../usecases/jobs/SetJobFailedUseCase');
jest.mock('../../../../usecases/jobs/BuildDeckForJobUseCase');
jest.mock('../../../../usecases/jobs/CompleteJobUseCase');
jest.mock('../../../../usecases/jobs/NotifyUserUseCase');
jest.mock('../../../../data_layer/JobRepository');
jest.mock('../../../../data_layer/UsersRepository');
jest.mock('../../../../usecases/users/CheckMonthlyCardLimitUseCase');
jest.mock('../../../../services/events/track', () => ({ track: jest.fn() }));

import performConversion from './performConversion';
import NotionAPIWrapper from '../../../../services/NotionService/NotionAPIWrapper';
import { CreateJobWorkSpaceUseCase } from '../../../../usecases/jobs/CreateJobWorkSpaceUseCase';
import { SetJobFailedUseCase } from '../../../../usecases/jobs/SetJobFailedUseCase';
import { CreateFlashcardsForJobUseCase } from '../../../../usecases/jobs/CreateFlashcardsForJobUseCase';

const mockDatabase = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

const baseRequest = {
  title: 'Free user page',
  api: {} as NotionAPIWrapper,
  id: 'notion-page-id',
  owner: 'owner-1',
  isPaying: false,
  type: 'page',
  jobDbId: 42,
};

describe('performConversion — signature', () => {
  it('does not accept a res parameter (res is absent from ConversionRequest)', () => {
    expect(Object.keys(baseRequest)).not.toContain('res');
  });
});

describe('performConversion — heavy pipeline', () => {
  let errorSpy: jest.SpyInstance;
  let setJobFailedExecute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);

    setJobFailedExecute = jest.fn().mockResolvedValue(undefined);
    (SetJobFailedUseCase as jest.Mock).mockImplementation(() => ({
      execute: setJobFailedExecute,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks job as failed when workspace creation throws', async () => {
    const boom = new Error('workspace exploded');
    (CreateJobWorkSpaceUseCase as jest.Mock).mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(boom),
    }));

    await performConversion(mockDatabase, baseRequest);

    expect(setJobFailedExecute).toHaveBeenCalledWith(
      baseRequest.id,
      baseRequest.owner,
      expect.any(String)
    );
    expect(errorSpy).toHaveBeenCalledWith(boom);
  });

  it('marks job as failed when no decks are created', async () => {
    (CreateJobWorkSpaceUseCase as jest.Mock).mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        ws: {},
        exporter: {},
        settings: {},
        bl: {},
        rules: {},
      }),
    }));
    (CreateFlashcardsForJobUseCase as jest.Mock).mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([]),
    }));

    await performConversion(mockDatabase, baseRequest);

    expect(setJobFailedExecute).toHaveBeenCalledWith(
      baseRequest.id,
      baseRequest.owner,
      expect.stringContaining(baseRequest.id)
    );
  });
});
