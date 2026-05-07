import {
  NoActiveAnkifyClientError,
  SendUploadToRacUseCase,
  UploadNotFoundError,
} from './SendUploadToRacUseCase';
import { AnkifyClient } from '../../entities/ankify';
import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySyncMappingsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncMappingsRepository';
import { IUploadRepository } from '../../data_layer/UploadRespository';
import {
  AnkiConnectClient,
  AnkiConnectError,
} from '../../services/ankify/AnkiConnectClient';
import { NormalizedCollection } from '../../services/ApkgPreviewService/types';

const sampleClient = (): AnkifyClient => ({
  id: 1,
  owner: 42,
  container_id: 'c',
  container_name: null,
  anki_port: 20000,
  vnc_port: 21000,
  novnc_port: 22000,
  status: 'active',
  created_at: new Date(),
  last_active_at: new Date(),
});

const sampleUpload = () => ({
  id: 7,
  owner: 42,
  filename: 'My Deck.apkg',
  key: 'uploads/my-deck.apkg',
  size_mb: 1,
  object_id: 'abc',
  created_at: new Date(),
});

const buildCollection = (overrides: {
  notes?: Map<number, { id: number; mid: number; tags: string; fields: string[]; guid?: string }>;
  cards?: { id: number; nid: number; did: number; ord: number }[];
  decks?: Map<number, { id: number; name: string }>;
}): NormalizedCollection => ({
  noteTypes: new Map(),
  notes: new Map(
    overrides.notes ??
      new Map([
        [
          100,
          {
            id: 100,
            mid: 1,
            tags: 'notion-sync',
            fields: ['front text', 'back text'],
            guid: 'guid-aaa',
          },
        ],
      ])
  ),
  decks:
    overrides.decks ??
    new Map([[10, { id: 10, name: 'Imported::Subdeck' }]]),
  cards: overrides.cards ?? [{ id: 1, nid: 100, did: 10, ord: 0 }],
});

const makeAnkiConnectStub = () => {
  const stub = {
    createDeck: jest.fn(async (_d: string) => 1),
    addNote: jest.fn(async (_n: unknown) => 9_876_543_210),
    updateNoteFields: jest.fn(async (_id: number, _f: unknown) => null),
  };
  return stub as unknown as AnkiConnectClient & typeof stub;
};

const makeRepos = (
  overrides: Partial<{
    activeClient: AnkifyClient | null;
    upload: ReturnType<typeof sampleUpload> | null;
    findMapping: ReturnType<AnkifySyncMappingsRepositoryInterface['findBySourceId']>;
  }> = {}
): {
  clients: jest.Mocked<AnkifyClientsRepositoryInterface>;
  mappings: jest.Mocked<AnkifySyncMappingsRepositoryInterface>;
  uploads: jest.Mocked<IUploadRepository>;
} => ({
  clients: {
    create: jest.fn(),
    listByOwner: jest.fn(),
    findActiveById: jest.fn(),
    findActiveByOwner: jest.fn(async () =>
      'activeClient' in overrides ? overrides.activeClient! : sampleClient()
    ),
    setStatus: jest.fn(),
    touchLastActiveAt: jest.fn(),
    reservedPorts: jest.fn(),
  } as unknown as jest.Mocked<AnkifyClientsRepositoryInterface>,
  mappings: {
    findBySourceId: jest.fn(async () => (await overrides.findMapping) ?? null),
    upsert: jest.fn(async (input) => ({
      id: 1,
      ankify_client_id: input.ankify_client_id,
      source_id: input.source_id,
      source_type: input.source_type,
      anki_note_id: input.anki_note_id,
      deck_name: input.deck_name,
      last_synced_at: new Date(),
    })),
    listByClient: jest.fn(),
    findByAnkiNoteId: jest.fn(),
    deleteByAnkiNoteId: jest.fn(),
  } as unknown as jest.Mocked<AnkifySyncMappingsRepositoryInterface>,
  uploads: {
    deleteUpload: jest.fn(),
    getUploadsByOwner: jest.fn(),
    findByIdAndOwner: jest.fn(
      async () => (overrides.upload === undefined ? sampleUpload() : overrides.upload) as never
    ),
    update: jest.fn(),
  } as unknown as jest.Mocked<IUploadRepository>,
});

describe('SendUploadToRacUseCase', () => {
  test('addNote path: creates deck, dispatches new notes, persists mappings', async () => {
    const { clients, mappings, uploads } = makeRepos();
    const ac = makeAnkiConnectStub();
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from('fake'),
      () => buildCollection({}),
      () => ac
    );

    const result = await useCase.execute({ uploadId: 7, owner: 42 });

    expect(ac.createDeck).toHaveBeenCalledWith('Imported::Subdeck');
    expect(ac.addNote).toHaveBeenCalledTimes(1);
    expect(ac.addNote).toHaveBeenCalledWith(
      expect.objectContaining({
        deckName: 'Imported::Subdeck',
        modelName: 'Basic',
        fields: { Front: 'front text', Back: 'back text' },
      })
    );
    expect(mappings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        source_id: 'guid-aaa',
        source_type: 'apkg_guid',
        anki_note_id: 9_876_543_210,
        deck_name: 'Imported::Subdeck',
      })
    );
    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.errors).toEqual([]);
  });

  test('updateNoteFields path: when mapping exists, updates instead of creating', async () => {
    const existingMapping = {
      id: 1,
      ankify_client_id: 1,
      source_id: 'guid-aaa',
      source_type: 'apkg_guid' as const,
      anki_note_id: 555,
      deck_name: 'Imported::Subdeck',
      last_synced_at: new Date(),
    };
    const { clients, mappings, uploads } = makeRepos({
      findMapping: Promise.resolve(existingMapping),
    });
    const ac = makeAnkiConnectStub();
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from('fake'),
      () => buildCollection({}),
      () => ac
    );

    const result = await useCase.execute({ uploadId: 7, owner: 42 });

    expect(ac.addNote).not.toHaveBeenCalled();
    expect(ac.updateNoteFields).toHaveBeenCalledWith(555, {
      Front: 'front text',
      Back: 'back text',
    });
    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
  });

  test('cloze detection: a {{c1::}} field uses the Cloze model', async () => {
    const { clients, mappings, uploads } = makeRepos();
    const ac = makeAnkiConnectStub();
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from('fake'),
      () =>
        buildCollection({
          notes: new Map([
            [
              100,
              {
                id: 100,
                mid: 1,
                tags: '',
                fields: ['Capital of {{c1::France}} is Paris.', 'extra'],
                guid: 'guid-cloze',
              },
            ],
          ]),
        }),
      () => ac
    );

    await useCase.execute({ uploadId: 7, owner: 42 });

    expect(ac.addNote).toHaveBeenCalledWith(
      expect.objectContaining({
        modelName: 'Cloze',
        fields: expect.objectContaining({
          Text: 'Capital of {{c1::France}} is Paris.',
          'Back Extra': 'extra',
        }),
      })
    );
  });

  test('NoActiveAnkifyClientError when the user has no provisioned client', async () => {
    const { clients, mappings, uploads } = makeRepos({ activeClient: null });
    const ac = makeAnkiConnectStub();
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from(''),
      () => buildCollection({}),
      () => ac
    );

    await expect(useCase.execute({ uploadId: 7, owner: 42 })).rejects.toBeInstanceOf(
      NoActiveAnkifyClientError
    );
  });

  test('UploadNotFoundError when the upload does not belong to the owner', async () => {
    const { clients, mappings, uploads } = makeRepos({ upload: null });
    const ac = makeAnkiConnectStub();
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from(''),
      () => buildCollection({}),
      () => ac
    );

    await expect(useCase.execute({ uploadId: 7, owner: 42 })).rejects.toBeInstanceOf(
      UploadNotFoundError
    );
  });

  test('per-note errors are collected without aborting the run', async () => {
    const { clients, mappings, uploads } = makeRepos();
    const ac = makeAnkiConnectStub();
    (ac.addNote as jest.Mock)
      .mockRejectedValueOnce(new AnkiConnectError('first failed'))
      .mockResolvedValueOnce(2);
    const useCase = new SendUploadToRacUseCase(
      clients,
      mappings,
      uploads,
      async () => Buffer.from('fake'),
      () =>
        buildCollection({
          notes: new Map([
            [
              100,
              {
                id: 100,
                mid: 1,
                tags: '',
                fields: ['a', 'b'],
                guid: 'guid-1',
              },
            ],
            [
              101,
              {
                id: 101,
                mid: 1,
                tags: '',
                fields: ['c', 'd'],
                guid: 'guid-2',
              },
            ],
          ]),
          cards: [
            { id: 1, nid: 100, did: 10, ord: 0 },
            { id: 2, nid: 101, did: 10, ord: 0 },
          ],
        }),
      () => ac
    );

    const result = await useCase.execute({ uploadId: 7, owner: 42 });

    expect(result.created).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('first failed');
  });
});
