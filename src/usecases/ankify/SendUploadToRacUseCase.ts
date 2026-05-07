import {
  AnkifyClient,
  AnkifySyncMapping,
  NewAnkifySyncMapping,
} from '../../entities/ankify';
import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySyncMappingsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncMappingsRepository';
import { AnkifySyncLogsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncLogsRepository';
import { IUploadRepository } from '../../data_layer/UploadRespository';
import {
  AnkiConnectClient,
  AnkiConnectError,
  AnkiConnectNote,
  AnkiConnectUnreachableError,
} from '../../services/ankify/AnkiConnectClient';
import { NormalizedCollection } from '../../services/ApkgPreviewService/types';

export class NoActiveAnkifyClientError extends Error {
  constructor() {
    super('No active Ankify client; provision one first');
    this.name = 'NoActiveAnkifyClientError';
  }
}

export class UploadNotFoundError extends Error {
  constructor() {
    super('Upload not found');
    this.name = 'UploadNotFoundError';
  }
}

export interface SendUploadToRacResult {
  client: AnkifyClient;
  deckNames: string[];
  created: number;
  updated: number;
  errors: string[];
}

export type AnkiConnectFactory = (
  host: string,
  port: number
) => AnkiConnectClient;

export type ApkgFetcher = (key: string) => Promise<Buffer>;

export type ApkgParser = (buffer: Buffer) => NormalizedCollection;

const CLOZE_PATTERN = /\{\{c\d+::/;

const isClozeField = (field: string | undefined): boolean =>
  field != null && CLOZE_PATTERN.test(field);

const buildAnkiConnectNoteFromApkgNote = (input: {
  fields: string[];
  tags: string;
  deckName: string;
}): AnkiConnectNote => {
  const trimmedTags = input.tags
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (isClozeField(input.fields[0])) {
    return {
      deckName: input.deckName,
      modelName: 'Cloze',
      fields: {
        Text: input.fields[0] ?? '',
        'Back Extra': input.fields[1] ?? '',
      },
      tags: trimmedTags,
      options: { allowDuplicate: true },
    };
  }
  return {
    deckName: input.deckName,
    modelName: 'Basic',
    fields: {
      Front: input.fields[0] ?? '',
      Back: input.fields[1] ?? '',
    },
    tags: trimmedTags,
    options: { allowDuplicate: true },
  };
};

const resolveDeckNameForNote = (
  noteId: number,
  collection: NormalizedCollection,
  fallback: string
): string => {
  const card = collection.cards.find((c) => c.nid === noteId);
  if (card == null) {
    return fallback;
  }
  const deck = collection.decks.get(card.did);
  return deck?.name ?? fallback;
};

interface SendUploadToRacInput {
  uploadId: number;
  owner: number;
  ankiConnectHost?: string;
}

export class SendUploadToRacUseCase {
  constructor(
    private readonly clients: AnkifyClientsRepositoryInterface,
    private readonly mappings: AnkifySyncMappingsRepositoryInterface,
    private readonly uploads: IUploadRepository,
    private readonly fetchApkgBytes: ApkgFetcher,
    private readonly parseApkg: ApkgParser,
    private readonly ankiConnect: AnkiConnectFactory,
    private readonly logs?: AnkifySyncLogsRepositoryInterface
  ) {}

  async execute(input: SendUploadToRacInput): Promise<SendUploadToRacResult> {
    const upload = await this.uploads.findByIdAndOwner(
      input.uploadId,
      input.owner
    );
    if (upload == null) {
      throw new UploadNotFoundError();
    }

    const client = await this.clients.findActiveByOwner(input.owner);
    if (client == null) {
      throw new NoActiveAnkifyClientError();
    }
    await this.clients.touchLastActiveAt(client.id);

    const buffer = await this.fetchApkgBytes(upload.key);
    const collection = this.parseApkg(buffer);

    const host = input.ankiConnectHost ?? 'localhost';
    const ac = this.ankiConnect(host, client.anki_port);
    const fallbackDeckName =
      (upload.filename ?? '').replace(/\.apkg$/i, '') || 'Imported';

    const seenDeckNames = new Set<string>();
    const result: SendUploadToRacResult = {
      client,
      deckNames: [],
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const [noteId, note] of collection.notes) {
      try {
        const deckName = resolveDeckNameForNote(
          noteId,
          collection,
          fallbackDeckName
        );

        if (!seenDeckNames.has(deckName)) {
          await ac.createDeck(deckName);
          seenDeckNames.add(deckName);
        }

        const sourceId = note.guid ?? `apkg-${note.id}`;
        const ankiNote = buildAnkiConnectNoteFromApkgNote({
          fields: note.fields,
          tags: note.tags,
          deckName,
        });

        const existing = await this.mappings.findBySourceId(client.id, sourceId);
        if (existing == null) {
          const ankiNoteId = await ac.addNote(ankiNote);
          await this.upsertMapping({
            ankify_client_id: client.id,
            source_id: sourceId,
            source_type: 'apkg_guid',
            anki_note_id: ankiNoteId,
            deck_name: deckName,
          });
          result.created += 1;
        } else {
          await ac.updateNoteFields(existing.anki_note_id, ankiNote.fields);
          await this.upsertMapping({
            ankify_client_id: client.id,
            source_id: sourceId,
            source_type: existing.source_type,
            anki_note_id: existing.anki_note_id,
            deck_name: deckName,
          });
          result.updated += 1;
        }
      } catch (error) {
        if (
          error instanceof AnkiConnectUnreachableError ||
          error instanceof AnkiConnectError
        ) {
          result.errors.push(`Note ${noteId}: ${error.message}`);
        } else {
          result.errors.push(`Note ${noteId}: ${(error as Error).message}`);
        }
      }
    }

    result.deckNames = Array.from(seenDeckNames);

    if (this.logs != null) {
      await this.logs
        .log({
          owner: input.owner,
          kind: 'dispatch',
          status: result.errors.length > 0 ? 'error' : 'success',
          message: `dispatched upload ${input.uploadId} (${result.created} new, ${result.updated} updated, ${result.errors.length} errors)`,
          payload: {
            upload_id: input.uploadId,
            ankify_client_id: client.id,
            deck_names: result.deckNames,
            created: result.created,
            updated: result.updated,
            errors: result.errors,
          },
        })
        .catch((logError) => {
          console.error('[ankify-sync-log] failed to record dispatch', logError);
        });
    }

    return result;
  }

  private async upsertMapping(input: NewAnkifySyncMapping): Promise<AnkifySyncMapping> {
    return this.mappings.upsert(input);
  }
}
