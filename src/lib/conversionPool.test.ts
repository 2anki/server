jest.mock('./storage/jobs/helpers/performConversion', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../data_layer/NotionRespository');
jest.mock('../data_layer/BlocksCacheRepository');

import performConversion from './storage/jobs/helpers/performConversion';
import NotionRepository from '../data_layer/NotionRespository';
import BlocksCacheRepository from '../data_layer/BlocksCacheRepository';
import {
  resolveConversionWorkers,
  runConversionInWorker,
  ConversionWorkerRequest,
} from './conversionPool';

const baseRequest: ConversionWorkerRequest = {
  id: 'notion-page-id',
  owner: '42',
  isPaying: true,
  type: 'page',
  title: 'Some page',
  jobDbId: 99,
};

describe('resolveConversionWorkers', () => {
  const previous = process.env.CONVERSION_WORKERS;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.CONVERSION_WORKERS;
    } else {
      process.env.CONVERSION_WORKERS = previous;
    }
  });

  it('defaults to 4 when env is unset', () => {
    delete process.env.CONVERSION_WORKERS;
    expect(resolveConversionWorkers()).toBe(4);
  });

  it('respects a valid CONVERSION_WORKERS override', () => {
    process.env.CONVERSION_WORKERS = '2';
    expect(resolveConversionWorkers()).toBe(2);
  });

  it('falls back to 4 when env is non-numeric or below 1', () => {
    process.env.CONVERSION_WORKERS = '0';
    expect(resolveConversionWorkers()).toBe(4);
    process.env.CONVERSION_WORKERS = 'banana';
    expect(resolveConversionWorkers()).toBe(4);
  });
});

describe('runConversionInWorker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NotionRepository as jest.Mock).mockImplementation(() => ({
      getNotionToken: jest.fn().mockResolvedValue('secret-token'),
    }));
    (BlocksCacheRepository as jest.Mock).mockImplementation(() => ({}));
  });

  it('rehydrates NotionAPIWrapper from owner and invokes performConversion', async () => {
    const fakeKnex = { __id: 'fake-knex' } as unknown as Parameters<
      typeof performConversion
    >[0];

    await runConversionInWorker(baseRequest, () => fakeKnex);

    expect(performConversion).toHaveBeenCalledTimes(1);
    const [db, request] = (performConversion as jest.Mock).mock.calls[0];
    expect(db).toBe(fakeKnex);
    expect(request).toEqual(
      expect.objectContaining({
        id: baseRequest.id,
        owner: baseRequest.owner,
        isPaying: baseRequest.isPaying,
        type: baseRequest.type,
        title: baseRequest.title,
        jobDbId: baseRequest.jobDbId,
      })
    );
    expect(request.api).toBeDefined();
    expect(typeof request.api.getPage).toBe('function');
  });

  it('throws when the owner has no Notion token', async () => {
    (NotionRepository as jest.Mock).mockImplementation(() => ({
      getNotionToken: jest.fn().mockResolvedValue(null),
    }));
    const fakeKnex = {} as unknown as Parameters<typeof performConversion>[0];

    await expect(
      runConversionInWorker(baseRequest, () => fakeKnex)
    ).rejects.toThrow(/notion token/i);
    expect(performConversion).not.toHaveBeenCalled();
  });

  it('surfaces unexpected rejections to the caller (controller .catch logs them)', async () => {
    (performConversion as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const fakeKnex = {} as unknown as Parameters<typeof performConversion>[0];

    await expect(
      runConversionInWorker(baseRequest, () => fakeKnex)
    ).rejects.toThrow('boom');
  });
});
