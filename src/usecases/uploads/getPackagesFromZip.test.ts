import { setupTests } from '../../test/configure-jest';
import { getPackagesFromZip } from './getPackagesFromZip';
import CardOption from '../../lib/parser/Settings/CardOption';
import Workspace from '../../lib/parser/WorkSpace';

jest.mock('../../infrastracture/adapters/fileConversion/PrepareDeck');
jest.mock('../../lib/zip/zip');

const mockPrepareDeck =
  jest.requireMock<{ PrepareDeck: jest.Mock }>(
    '../../infrastracture/adapters/fileConversion/PrepareDeck'
  ).PrepareDeck;

const mockZipHandlerClass =
  jest.requireMock<{ ZipHandler: jest.Mock }>('../../lib/zip/zip').ZipHandler;

beforeEach(() => {
  setupTests();
  jest.clearAllMocks();
});

describe('getPackagesFromZip — bounded concurrency', () => {
  it('runs PrepareDeck for each file and returns results in input order', async () => {
    const fileCount = 8;
    const fileNames = Array.from(
      { length: fileCount },
      (_, i) => `deck${i}.html`
    );

    mockZipHandlerClass.mockImplementation(() => ({
      build: jest.fn().mockResolvedValue(undefined),
      getFileNames: jest.fn().mockReturnValue(fileNames),
      files: fileNames.map((name) => ({ name, contents: '<html></html>' })),
    }));

    mockPrepareDeck.mockImplementation(({ name }: { name: string }) => {
      return Promise.resolve({
        name,
        apkg: Buffer.from(''),
        deck: [],
        cardCount: 1,
      });
    });

    const settings = new CardOption({});
    const workspace = {} as Workspace;

    const result = await getPackagesFromZip(
      Buffer.from('fake-zip') as unknown as Uint8Array,
      false,
      settings,
      workspace
    );

    expect(result.packages).toHaveLength(fileCount);
    expect(result.packages.map((p) => p.name)).toEqual(
      fileNames.map((n) => n)
    );
  });

  it('caps concurrent PrepareDeck calls at UPLOAD_BUILD_CONCURRENCY (default 4)', async () => {
    const fileCount = 8;
    const fileNames = Array.from(
      { length: fileCount },
      (_, i) => `deck${i}.html`
    );

    mockZipHandlerClass.mockImplementation(() => ({
      build: jest.fn().mockResolvedValue(undefined),
      getFileNames: jest.fn().mockReturnValue(fileNames),
      files: fileNames.map((name) => ({ name, contents: '<html></html>' })),
    }));

    let inFlight = 0;
    let peakInFlight = 0;

    mockPrepareDeck.mockImplementation(({ name }: { name: string }) => {
      inFlight += 1;
      if (inFlight > peakInFlight) peakInFlight = inFlight;
      return new Promise((resolve) => {
        setImmediate(() => {
          inFlight -= 1;
          resolve({
            name,
            apkg: Buffer.from(''),
            deck: [],
            cardCount: 1,
          });
        });
      });
    });

    delete process.env.UPLOAD_BUILD_CONCURRENCY;

    const settings = new CardOption({});
    const workspace = {} as Workspace;

    await getPackagesFromZip(
      Buffer.from('fake-zip') as unknown as Uint8Array,
      false,
      settings,
      workspace
    );

    expect(peakInFlight).toBeGreaterThan(1);
    expect(peakInFlight).toBeLessThanOrEqual(4);
  });

  it('respects UPLOAD_BUILD_CONCURRENCY env override', async () => {
    process.env.UPLOAD_BUILD_CONCURRENCY = '2';

    const fileCount = 6;
    const fileNames = Array.from(
      { length: fileCount },
      (_, i) => `deck${i}.html`
    );

    mockZipHandlerClass.mockImplementation(() => ({
      build: jest.fn().mockResolvedValue(undefined),
      getFileNames: jest.fn().mockReturnValue(fileNames),
      files: fileNames.map((name) => ({ name, contents: '<html></html>' })),
    }));

    let inFlight = 0;
    let peakInFlight = 0;

    mockPrepareDeck.mockImplementation(({ name }: { name: string }) => {
      inFlight += 1;
      if (inFlight > peakInFlight) peakInFlight = inFlight;
      return new Promise((resolve) => {
        setImmediate(() => {
          inFlight -= 1;
          resolve({
            name,
            apkg: Buffer.from(''),
            deck: [],
            cardCount: 1,
          });
        });
      });
    });

    const settings = new CardOption({});
    const workspace = {} as Workspace;

    await getPackagesFromZip(
      Buffer.from('fake-zip') as unknown as Uint8Array,
      false,
      settings,
      workspace
    );

    expect(peakInFlight).toBeLessThanOrEqual(2);

    delete process.env.UPLOAD_BUILD_CONCURRENCY;
  });

  it('propagates errors from PrepareDeck', async () => {
    const fileNames = ['deck0.html', 'deck1.html'];

    mockZipHandlerClass.mockImplementation(() => ({
      build: jest.fn().mockResolvedValue(undefined),
      getFileNames: jest.fn().mockReturnValue(fileNames),
      files: fileNames.map((name) => ({ name, contents: '<html></html>' })),
    }));

    mockPrepareDeck.mockRejectedValue(new Error('spawn failed'));

    const settings = new CardOption({});
    const workspace = {} as Workspace;

    await expect(
      getPackagesFromZip(
        Buffer.from('fake-zip') as unknown as Uint8Array,
        false,
        settings,
        workspace
      )
    ).rejects.toThrow('spawn failed');
  });

  it('returns empty packages when fileContents is undefined', async () => {
    const settings = new CardOption({});
    const workspace = {} as Workspace;

    const result = await getPackagesFromZip(
      undefined,
      false,
      settings,
      workspace
    );

    expect(result.packages).toEqual([]);
  });
});
