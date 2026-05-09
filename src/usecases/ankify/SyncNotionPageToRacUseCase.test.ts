import { SyncNotionPageToRacUseCase } from './SyncNotionPageToRacUseCase';
import {
  AnkifyClient,
  AnkifyNotionSubscription,
} from '../../entities/ankify';
import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySyncMappingsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncMappingsRepository';
import { AnkifySyncConflictsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncConflictsRepository';
import { AnkifyNotionSubscriptionsRepositoryInterface } from '../../data_layer/ankify/AnkifyNotionSubscriptionsRepository';
import { AnkifySyncLogsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncLogsRepository';
import { INotionRepository } from '../../data_layer/NotionRespository';
import { AnkiConnectClient } from '../../services/ankify/AnkiConnectClient';

const sampleClient = (): AnkifyClient => ({
  id: 1,
  owner: 42,
  container_id: 'c',
  container_name: null,
  anki_port: 20000,
  vnc_port: 21000,
  novnc_port: 22000,
  anki_connect_api_key: null,
  status: 'active',
  created_at: new Date(),
  last_active_at: new Date(),
});

const sampleSubscription = (
  overrides: Partial<AnkifyNotionSubscription> = {}
): AnkifyNotionSubscription => ({
  id: 1,
  owner: 42,
  ankify_client_id: 1,
  notion_page_id: 'page-id',
  notion_page_title: null,
  notion_page_url: null,
  notion_page_icon: null,
  enabled: true,
  last_polled_at: null,
  last_synced_at: null,
  last_error: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const makeClients = (): jest.Mocked<AnkifyClientsRepositoryInterface> =>
  ({
    create: jest.fn(),
    listByOwner: jest.fn(),
    findActiveById: jest.fn(),
    findActiveByOwner: jest.fn(async () => sampleClient()),
    setStatus: jest.fn(),
    touchLastActiveAt: jest.fn(),
    reservedPorts: jest.fn(),
    listIdleSince: jest.fn(),
  } as unknown as jest.Mocked<AnkifyClientsRepositoryInterface>);

const makeMappings = (): jest.Mocked<AnkifySyncMappingsRepositoryInterface> =>
  ({
    findBySourceId: jest.fn(async () => null),
    upsert: jest.fn(),
    listByClient: jest.fn(),
    findByAnkiNoteId: jest.fn(),
    deleteByAnkiNoteId: jest.fn(),
  } as unknown as jest.Mocked<AnkifySyncMappingsRepositoryInterface>);

const makeConflicts = (): jest.Mocked<AnkifySyncConflictsRepositoryInterface> =>
  ({
    hasPending: jest.fn(async () => false),
    recordOrFindPending: jest.fn(),
  } as unknown as jest.Mocked<AnkifySyncConflictsRepositoryInterface>);

const makeSubscriptionsRepo = (
  upsertResult: AnkifyNotionSubscription = sampleSubscription()
): jest.Mocked<AnkifyNotionSubscriptionsRepositoryInterface> =>
  ({
    upsert: jest.fn(async () => upsertResult),
    listByOwner: jest.fn(),
    listEnabled: jest.fn(),
    findByPageId: jest.fn(),
    findById: jest.fn(),
    setEnabled: jest.fn(),
    deleteById: jest.fn(),
    recordPoll: jest.fn(),
  } as unknown as jest.Mocked<AnkifyNotionSubscriptionsRepositoryInterface>);

const makeLogs = (): jest.Mocked<AnkifySyncLogsRepositoryInterface> =>
  ({
    log: jest.fn(async () => undefined),
    listByOwner: jest.fn(),
  } as unknown as jest.Mocked<AnkifySyncLogsRepositoryInterface>);

const makeNotionRepo = (
  token: string | null = 'notion-token'
): jest.Mocked<INotionRepository> =>
  ({
    getNotionData: jest.fn(),
    saveNotionToken: jest.fn(),
    getNotionToken: jest.fn(async () => token),
    deleteBlocksByOwner: jest.fn(),
    deleteNotionData: jest.fn(),
  } as unknown as jest.Mocked<INotionRepository>);

const makeAnkiConnectStub = () =>
  ({
    createDeck: jest.fn(async () => 1),
    addNote: jest.fn(async () => 7),
    notesInfo: jest.fn(async () => []),
    updateNoteFields: jest.fn(async () => null),
    sync: jest.fn(async () => null),
  } as unknown as AnkiConnectClient & { [k: string]: jest.Mock });

describe('SyncNotionPageToRacUseCase', () => {
  test('persists icon returned by the page-meta fetcher on upsert', async () => {
    const clients = makeClients();
    const mappings = makeMappings();
    const conflicts = makeConflicts();
    const subscriptions = makeSubscriptionsRepo();
    const logs = makeLogs();
    const notionRepo = makeNotionRepo();
    const ac = makeAnkiConnectStub();

    const useCase = new SyncNotionPageToRacUseCase(
      clients,
      mappings,
      conflicts,
      subscriptions,
      logs,
      notionRepo,
      () => ac,
      () => async () => [],
      (_token: string) => async (_pageId: string) => ({
        title: 'Algebra',
        url: 'https://www.notion.so/algebra',
        icon: '📘',
      })
    );

    await useCase.execute({
      owner: 42,
      notionPageId: 'page-id',
      trigger: 'manual',
    });

    expect(subscriptions.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        notion_page_id: 'page-id',
        notion_page_title: 'Algebra',
        notion_page_url: 'https://www.notion.so/algebra',
        notion_page_icon: '📘',
      })
    );
  });

  test('lazy-fills missing icon on subsequent sync when the meta fetcher returns one', async () => {
    const clients = makeClients();
    const mappings = makeMappings();
    const conflicts = makeConflicts();
    const subscriptions = makeSubscriptionsRepo(
      sampleSubscription({ notion_page_icon: null })
    );
    const logs = makeLogs();
    const notionRepo = makeNotionRepo();
    const ac = makeAnkiConnectStub();

    const useCase = new SyncNotionPageToRacUseCase(
      clients,
      mappings,
      conflicts,
      subscriptions,
      logs,
      notionRepo,
      () => ac,
      () => async () => [],
      () => async () => ({
        title: null,
        url: null,
        icon: 'https://example.com/icon.png',
      })
    );

    await useCase.execute({
      owner: 42,
      notionPageId: 'page-id',
      trigger: 'polling',
    });

    expect(subscriptions.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        notion_page_icon: 'https://example.com/icon.png',
      })
    );
  });
});
