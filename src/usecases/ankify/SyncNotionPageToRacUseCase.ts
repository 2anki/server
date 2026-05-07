import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySyncMappingsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncMappingsRepository';
import { AnkifySyncConflictsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncConflictsRepository';
import { AnkifyNotionSubscriptionsRepositoryInterface } from '../../data_layer/ankify/AnkifyNotionSubscriptionsRepository';
import { AnkifySyncLogsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncLogsRepository';
import { INotionRepository } from '../../data_layer/NotionRespository';
import { AnkifyClient, AnkifyNotionSubscription } from '../../entities/ankify';
import { AnkiConnectClient } from '../../services/ankify/AnkiConnectClient';
import {
  walkNotionPageForFlashcards,
  NotionBlockChildrenFetcher,
} from '../../services/ankify/notionPageWalker';
import { NoActiveAnkifyClientError } from './SendUploadToRacUseCase';
import { NotionNotConnectedError } from './ExportReviewDataToNotionUseCase';

export { NotionNotConnectedError } from './ExportReviewDataToNotionUseCase';

export interface SyncNotionPageInput {
  owner: number;
  notionPageId: string;
  notionPageTitle?: string | null;
  notionPageUrl?: string | null;
  trigger: 'manual' | 'polling' | 'webhook';
  ankiConnectHost?: string;
}

export interface NotionPageMeta {
  title: string | null;
  url: string | null;
}

export type NotionPageMetaFetcher = (
  token: string
) => (notionPageId: string) => Promise<NotionPageMeta>;

export type AnkiWebSyncStatus = 'synced' | 'failed' | 'skipped';

export interface SyncNotionPageResult {
  client: AnkifyClient;
  subscription: AnkifyNotionSubscription;
  created: number;
  updated: number;
  conflicts: number;
  unchanged: number;
  errors: string[];
  ankiWebSync: AnkiWebSyncStatus;
  ankiWebSyncError: string | null;
}

export type AnkiConnectFactory = (
  host: string,
  port: number,
  apiKey: string | null
) => AnkiConnectClient;

export type NotionFetcherFactory = (token: string) => NotionBlockChildrenFetcher;

const FRONT_FIELD_BASIC = 'Front';
const BACK_FIELD_BASIC = 'Back';
const DECK_NAME_FALLBACK = 'Notion Sync';

export class SyncNotionPageToRacUseCase {
  constructor(
    private readonly clients: AnkifyClientsRepositoryInterface,
    private readonly mappings: AnkifySyncMappingsRepositoryInterface,
    private readonly conflicts: AnkifySyncConflictsRepositoryInterface,
    private readonly subscriptions: AnkifyNotionSubscriptionsRepositoryInterface,
    private readonly logs: AnkifySyncLogsRepositoryInterface,
    private readonly notionRepo: INotionRepository,
    private readonly ankiConnect: AnkiConnectFactory,
    private readonly notionFetcher: NotionFetcherFactory,
    private readonly notionPageMeta?: NotionPageMetaFetcher
  ) {}

  async execute(input: SyncNotionPageInput): Promise<SyncNotionPageResult> {
    const client = await this.clients.findActiveByOwner(input.owner);
    if (client == null) {
      throw new NoActiveAnkifyClientError();
    }
    await this.clients.touchLastActiveAt(client.id);

    const token = await this.notionRepo.getNotionToken(String(input.owner));
    if (token == null || token.trim().length === 0) {
      throw new NotionNotConnectedError();
    }

    let pageTitle: string | null | undefined = input.notionPageTitle;
    let pageUrl: string | null | undefined = input.notionPageUrl;
    if (this.notionPageMeta != null) {
      try {
        const meta = await this.notionPageMeta(token)(input.notionPageId);
        pageTitle = meta.title;
        pageUrl = meta.url;
      } catch {
        // Notion API hiccup — keep whatever the input or DB already has.
      }
    }

    const subscription = await this.subscriptions.upsert({
      owner: input.owner,
      ankify_client_id: client.id,
      notion_page_id: input.notionPageId,
      notion_page_title: pageTitle,
      notion_page_url: pageUrl,
      enabled: true,
    });

    const result: SyncNotionPageResult = {
      client,
      subscription,
      created: 0,
      updated: 0,
      conflicts: 0,
      unchanged: 0,
      errors: [],
      ankiWebSync: 'skipped',
      ankiWebSyncError: null,
    };

    try {
      const fetchChildren = this.notionFetcher(token);
      const cards = await walkNotionPageForFlashcards(
        input.notionPageId,
        fetchChildren
      );

      const ac = this.ankiConnect(
        input.ankiConnectHost ?? 'localhost',
        client.anki_port,
        client.anki_connect_api_key
      );
      await ac.createDeck(DECK_NAME_FALLBACK);

      for (const card of cards) {
        try {
          const existing = await this.mappings.findBySourceId(
            client.id,
            card.notion_block_id
          );
          if (existing == null) {
            const ankiNoteId = await ac.addNote({
              deckName: DECK_NAME_FALLBACK,
              modelName: 'Basic',
              fields: {
                [FRONT_FIELD_BASIC]: card.front,
                [BACK_FIELD_BASIC]: card.back,
              },
              tags: ['ankify-notion-sync'],
              options: { allowDuplicate: true },
            });
            await this.mappings.upsert({
              ankify_client_id: client.id,
              source_id: card.notion_block_id,
              source_type: 'notion_block',
              anki_note_id: ankiNoteId,
              deck_name: DECK_NAME_FALLBACK,
            });
            result.created += 1;
            continue;
          }

          const hasOpenConflict = await this.conflicts.hasPending(
            client.id,
            card.notion_block_id
          );
          if (hasOpenConflict) {
            result.conflicts += 1;
            continue;
          }

          const lastSyncedAt = existing.last_synced_at;
          const ankiInfo = await ac.notesInfo([existing.anki_note_id]);
          const ankiNote = ankiInfo[0];
          const ankiMod = ankiNote?.mod ?? null;
          const ankiFront = ankiNote?.fields?.[FRONT_FIELD_BASIC]?.value ?? '';
          const ankiBack = ankiNote?.fields?.[BACK_FIELD_BASIC]?.value ?? '';
          const lastSyncedSeconds = Math.floor(lastSyncedAt.getTime() / 1000);

          const notionChanged =
            card.notion_last_edited_at.getTime() > lastSyncedAt.getTime();
          const ankiChanged =
            ankiMod != null && ankiMod > lastSyncedSeconds;
          const ankiContentDiffers =
            ankiFront !== card.front || ankiBack !== card.back;

          if (notionChanged && ankiChanged && ankiContentDiffers) {
            await this.conflicts.recordOrFindPending({
              owner: input.owner,
              ankify_client_id: client.id,
              subscription_id: subscription.id,
              source_id: card.notion_block_id,
              anki_note_id: existing.anki_note_id,
              kind: 'both_edited',
              notion_last_edited_at: card.notion_last_edited_at,
              anki_modified_at: ankiMod,
              notion_snapshot: { front: card.front, back: card.back },
              anki_snapshot: { front: ankiFront, back: ankiBack },
            });
            result.conflicts += 1;
            continue;
          }

          if (notionChanged && ankiContentDiffers) {
            await ac.updateNoteFields(existing.anki_note_id, {
              [FRONT_FIELD_BASIC]: card.front,
              [BACK_FIELD_BASIC]: card.back,
            });
            await this.mappings.upsert({
              ankify_client_id: client.id,
              source_id: card.notion_block_id,
              source_type: existing.source_type,
              anki_note_id: existing.anki_note_id,
              deck_name: existing.deck_name,
            });
            result.updated += 1;
            continue;
          }

          result.unchanged += 1;
        } catch (error) {
          result.errors.push(
            `Block ${card.notion_block_id}: ${(error as Error).message}`
          );
        }
      }

      if (result.created + result.updated > 0) {
        try {
          await ac.sync();
          result.ankiWebSync = 'synced';
        } catch (syncError) {
          result.ankiWebSync = 'failed';
          result.ankiWebSyncError = (syncError as Error).message;
        }
      }

      await this.subscriptions.recordPoll(subscription.id, {
        synced: true,
        error: null,
      });
    } catch (error) {
      const message = (error as Error).message;
      result.errors.push(message);
      await this.subscriptions.recordPoll(subscription.id, {
        error: message,
      });
      throw error;
    } finally {
      await this.logs
        .log({
          owner: input.owner,
          kind: 'dispatch',
          status: result.errors.length > 0 ? 'error' : 'success',
          message: `notion-page sync ${input.trigger} for ${input.notionPageId} (created ${result.created}, updated ${result.updated}, conflicts ${result.conflicts})`,
          payload: {
            trigger: input.trigger,
            page_id: input.notionPageId,
            ankify_client_id: client.id,
            created: result.created,
            updated: result.updated,
            conflicts: result.conflicts,
            unchanged: result.unchanged,
            errors: result.errors,
          },
        })
        .catch((e) => {
          console.error('[ankify-sync-log] failed to record sync', e);
        });
    }

    return result;
  }
}
