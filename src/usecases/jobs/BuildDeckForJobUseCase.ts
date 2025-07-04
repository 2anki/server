import JobRepository from '../../data_layer/JobRepository';
import BlockHandler from '../../services/NotionService/BlockHandler/BlockHandler';
import CustomExporter from '../../lib/parser/exporters/CustomExporter';
import Deck from '../../lib/parser/Deck';
import Workspace from '../../lib/parser/WorkSpace';
import CardOption from '../../lib/parser/Settings';
import StorageHandler from '../../lib/storage/StorageHandler';
import CardGenerator from '../../lib/anki/CardGenerator';
import fs from 'fs';
import { toText } from '../../services/NotionService/BlockHandler/helpers/deckNameToText';
import {
  addDeckNameSuffix,
  DECK_NAME_SUFFIX,
  isValidDeckName,
} from '../../lib/anki/format';
import { FileSizeInMegaBytes } from '../../lib/misc/file';
import { getDatabase } from '../../data_layer';

interface BuildDeckForJobUseCaseOutput {
  size: number;
  key: string;
  apkg: Buffer<ArrayBufferLike>;
}

interface BuildDeckForJobUseCaseInput {
  bl: BlockHandler;
  exporter: CustomExporter;
  decks: Deck[];
  ws: Workspace;
  settings: CardOption;
  storage: StorageHandler;
  id: string;
  owner: string;
}

export class BuildDeckForJobUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(
    input: BuildDeckForJobUseCaseInput
  ): Promise<BuildDeckForJobUseCaseOutput> {
    const { bl, exporter, decks, ws, settings, storage, id, owner } = input;
    // Filter out decks with no cards
    const filteredDecks = decks.filter(
      (deck) => deck.cards && deck.cards.length > 0
    );

    exporter.configure(filteredDecks);
    const gen = new CardGenerator(ws.location);
    const payload = (await gen.run()) as string;
    const apkg = fs.readFileSync(payload);
    const filename = toText(
      (() => {
        const f = settings.deckName || bl.firstPageTitle || id;
        if (isValidDeckName(f)) {
          return f;
        }
        return addDeckNameSuffix(f);
      })()
    );

    const key = storage.uniqify(id, owner, 200, DECK_NAME_SUFFIX);
    await storage.uploadFile(key, apkg);
    const size = FileSizeInMegaBytes(payload);
    await getDatabase()('uploads').insert({
      object_id: id,
      owner,
      filename,
      key,
      size_mb: size,
    });
    return { size, key, apkg };
  }
}
