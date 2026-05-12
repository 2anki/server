import ImportApkgToNotionUseCase from './ImportApkgToNotionUseCase';
import ApkgPreviewService from '../../services/ApkgPreviewService/ApkgPreviewService';
import ApkgToNotionBlocksService, {
  NoteTooLargeError,
} from '../../services/ApkgToNotionBlocksService';
import NotionAPIWrapper from '../../services/NotionService/NotionAPIWrapper';
import JobRepository from '../../data_layer/JobRepository';
import { NormalizedCollection } from '../../services/ApkgPreviewService/types';
import { ParsedApkg } from '../../services/ApkgPreviewService/ApkgPreviewService';

function makeCollection(noteCount: number): NormalizedCollection {
  const noteTypes = new Map([
    [
      1,
      {
        id: 1,
        name: 'Basic',
        type: 0 as const,
        css: '',
        fields: [
          { name: 'Front', ord: 0 },
          { name: 'Back', ord: 1 },
        ],
        templates: [{ name: 'Card 1', ord: 0, qfmt: '', afmt: '' }],
      },
    ],
  ]);

  const notes = new Map(
    Array.from({ length: noteCount }, (_, i) => [
      i + 1,
      {
        id: i + 1,
        mid: 1,
        tags: '',
        fields: [`Front ${i + 1}`, `Back ${i + 1}`],
      },
    ])
  );

  return {
    noteTypes,
    notes,
    decks: new Map([[1, { id: 1, name: 'Test Deck' }]]),
    cards: Array.from({ length: noteCount }, (_, i) => ({
      id: i + 1,
      nid: i + 1,
      did: 1,
      ord: 0,
    })),
  };
}

function makeParsed(noteCount: number): ParsedApkg {
  return {
    collection: makeCollection(noteCount),
    mediaMap: new Map(),
    mediaEntries: new Map(),
    parsedAt: Date.now(),
  };
}

describe('ImportApkgToNotionUseCase', () => {
  let previewService: jest.Mocked<ApkgPreviewService>;
  let blocksService: ApkgToNotionBlocksService;
  let jobRepository: jest.Mocked<JobRepository>;
  let notionApi: jest.Mocked<NotionAPIWrapper>;
  let useCase: ImportApkgToNotionUseCase;

  beforeEach(() => {
    previewService = {
      parse: jest.fn(),
      getMeta: jest.fn(),
      getCardsPage: jest.fn(),
      getMediaEntry: jest.fn(),
    } as unknown as jest.Mocked<ApkgPreviewService>;

    blocksService = new ApkgToNotionBlocksService();

    jobRepository = {
      updateJobStatus: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue(undefined),
      findJobById: jest.fn(),
    } as unknown as jest.Mocked<JobRepository>;

    notionApi = {
      createPage: jest.fn().mockResolvedValue({ id: 'page-123' }),
      appendBlocks: jest.fn().mockResolvedValue({}),
      getPage: jest
        .fn()
        .mockResolvedValue({ url: 'https://notion.so/page-123' }),
    } as unknown as jest.Mocked<NotionAPIWrapper>;

    useCase = new ImportApkgToNotionUseCase(
      previewService,
      blocksService,
      jobRepository
    );
  });

  it('creates Notion pages and reports completion', async () => {
    previewService.parse.mockResolvedValue(makeParsed(3));

    await useCase.execute(
      Buffer.from('fake'),
      'parent-page',
      'user-1',
      notionApi,
      'job-1'
    );

    expect(notionApi.createPage).toHaveBeenCalledWith(
      'parent-page',
      'Test Deck'
    );
    expect(notionApi.appendBlocks).toHaveBeenCalled();

    const finalUpdate =
      jobRepository.updateJobStatus.mock.calls[
        jobRepository.updateJobStatus.mock.calls.length - 1
      ];
    expect(finalUpdate[2]).toBe('done');
    const result = JSON.parse(finalUpdate[3] as string);
    expect(result.imported).toBe(3);
    expect(result.total_notes).toBe(3);
    expect(result.notion_page_url).toBe('https://notion.so/page-123');
  });

  it('marks the job as failed when transform throws NoteTooLargeError', async () => {
    previewService.parse.mockResolvedValue(makeParsed(2));

    const throwingBlocksService = {
      transform: () => {
        throw new NoteTooLargeError(5001);
      },
    } as unknown as ApkgToNotionBlocksService;

    const useCaseWithLimit = new ImportApkgToNotionUseCase(
      previewService,
      throwingBlocksService,
      jobRepository
    );

    await useCaseWithLimit.execute(
      Buffer.from('fake'),
      'parent-page',
      'user-1',
      notionApi,
      'job-1'
    );

    const failCall = jobRepository.updateJobStatus.mock.calls.find(
      (c) => c[2] === 'failed'
    );
    expect(failCall).toBeDefined();
    expect(failCall![3]).toContain('5001');
  });

  it('tracks progress during batch writes', async () => {
    previewService.parse.mockResolvedValue(makeParsed(3));

    await useCase.execute(
      Buffer.from('fake'),
      'parent-page',
      'user-1',
      notionApi,
      'job-1'
    );

    const progressCalls = jobRepository.updateJobStatus.mock.calls.filter(
      (c) => c[2] === 'processing'
    );
    expect(progressCalls.length).toBeGreaterThanOrEqual(1);
    expect(progressCalls[0][3]).toMatch(/0\/3/);
  });

  it('marks the job as failed on Notion API errors', async () => {
    previewService.parse.mockResolvedValue(makeParsed(1));
    notionApi.createPage.mockRejectedValue(new Error('Notion rate limit'));

    await useCase.execute(
      Buffer.from('fake'),
      'parent-page',
      'user-1',
      notionApi,
      'job-1'
    );

    const failCall = jobRepository.updateJobStatus.mock.calls.find(
      (c) => c[2] === 'failed'
    );
    expect(failCall).toBeDefined();
    expect(failCall![3]).toContain('Notion rate limit');
  });

  it('handles sub-decks by creating nested pages', async () => {
    const collection = makeCollection(1);
    collection.decks.set(2, { id: 2, name: 'Parent::Child' });
    collection.notes.set(2, {
      id: 2,
      mid: 1,
      tags: '',
      fields: ['Front 2', 'Back 2'],
    });
    collection.cards.push({ id: 2, nid: 2, did: 2, ord: 0 });
    const parsed: ParsedApkg = {
      collection,
      mediaMap: new Map(),
      mediaEntries: new Map(),
      parsedAt: Date.now(),
    };

    previewService.parse.mockResolvedValue(parsed);

    await useCase.execute(
      Buffer.from('fake'),
      'parent-page',
      'user-1',
      notionApi,
      'job-1'
    );

    expect(notionApi.createPage).toHaveBeenCalledTimes(3);
    const pageNames = notionApi.createPage.mock.calls.map((c) => c[1]);
    expect(pageNames).toContain('Parent');
    expect(pageNames).toContain('Child');
  });
});
