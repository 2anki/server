import { BuildDeckForJobUseCase } from './BuildDeckForJobUseCase';
import { EmptyDeckError } from './EmptyDeckError';
import JobRepository from '../../data_layer/JobRepository';
import Deck from '../../lib/parser/Deck';
import CustomExporter from '../../lib/parser/exporters/CustomExporter';
import BlockHandler from '../../services/NotionService/BlockHandler/BlockHandler';
import Workspace from '../../lib/parser/WorkSpace';
import StorageHandler from '../../lib/storage/StorageHandler';
import CardOption from '../../lib/parser/Settings';
import CardGenerator from '../../lib/anki/CardGenerator';

jest.mock('../../lib/anki/CardGenerator');
jest.mock('../../data_layer', () => ({
  getDatabase: jest.fn(),
}));

describe('BuildDeckForJobUseCase', () => {
  const jobRepository = {
    updateJobStatus: jest.fn().mockResolvedValue(undefined),
  } as unknown as JobRepository;

  const exporter = {
    configure: jest.fn(),
  } as unknown as CustomExporter;

  const bl = { firstPageTitle: 'Title' } as unknown as BlockHandler;
  const ws = { location: '/tmp/ws' } as unknown as Workspace;
  const storage = {
    uniqify: jest.fn(),
    uploadFile: jest.fn(),
  } as unknown as StorageHandler;
  const settings = { deckName: 'Deck' } as unknown as CardOption;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws EmptyDeckError when every deck has zero cards and never invokes CardGenerator', async () => {
    const useCase = new BuildDeckForJobUseCase(jobRepository);
    const decks: Deck[] = [
      { cards: [] } as unknown as Deck,
      { cards: [] } as unknown as Deck,
    ];

    await expect(
      useCase.execute({
        bl,
        exporter,
        decks,
        ws,
        settings,
        storage,
        id: 'job-1',
        owner: 'owner-1',
      })
    ).rejects.toBeInstanceOf(EmptyDeckError);

    expect(CardGenerator).not.toHaveBeenCalled();
    expect(exporter.configure).not.toHaveBeenCalled();
  });
});
