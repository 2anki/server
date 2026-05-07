import express from 'express';
import Docker from 'dockerode';

import AnkifyController from '../controllers/AnkifyController';
import { AnkifyClientsRepository } from '../data_layer/ankify/AnkifyClientsRepository';
import { AnkifySyncMappingsRepository } from '../data_layer/ankify/AnkifySyncMappingsRepository';
import UploadRepository from '../data_layer/UploadRespository';
import { getDatabase } from '../data_layer';
import { RacService } from '../services/ankify/RacService';
import {
  AnkiConnectClient,
  buildAnkiConnectUrl,
} from '../services/ankify/AnkiConnectClient';
import ProvisionAnkifyClientUseCase from '../usecases/ankify/ProvisionAnkifyClientUseCase';
import ListAnkifyClientsUseCase from '../usecases/ankify/ListAnkifyClientsUseCase';
import StopAnkifyClientUseCase from '../usecases/ankify/StopAnkifyClientUseCase';
import RespinAnkifyClientUseCase from '../usecases/ankify/RespinAnkifyClientUseCase';
import { SendUploadToRacUseCase } from '../usecases/ankify/SendUploadToRacUseCase';
import { ExportReviewDataToNotionUseCase } from '../usecases/ankify/ExportReviewDataToNotionUseCase';
import { ConfigureExportScheduleUseCase } from '../usecases/ankify/ConfigureExportScheduleUseCase';
import { GetExportScheduleUseCase } from '../usecases/ankify/GetExportScheduleUseCase';
import { DeleteExportScheduleUseCase } from '../usecases/ankify/DeleteExportScheduleUseCase';
import { ListSyncLogsUseCase } from '../usecases/ankify/ListSyncLogsUseCase';
import { AnkifySyncLogsRepository } from '../data_layer/ankify/AnkifySyncLogsRepository';
import { AnkifyNotionSubscriptionsRepository } from '../data_layer/ankify/AnkifyNotionSubscriptionsRepository';
import { AnkifySyncConflictsRepository } from '../data_layer/ankify/AnkifySyncConflictsRepository';
import { SyncNotionPageToRacUseCase } from '../usecases/ankify/SyncNotionPageToRacUseCase';
import { ListNotionSubscriptionsUseCase } from '../usecases/ankify/ListNotionSubscriptionsUseCase';
import { DeleteNotionSubscriptionUseCase } from '../usecases/ankify/DeleteNotionSubscriptionUseCase';
import { ListConflictsUseCase } from '../usecases/ankify/ListConflictsUseCase';
import { ResolveConflictUseCase } from '../usecases/ankify/ResolveConflictUseCase';
import { ListNotionDatabasesUseCase } from '../usecases/ankify/ListNotionDatabasesUseCase';
import { CreateReviewTrackerDatabaseUseCase } from '../usecases/ankify/CreateReviewTrackerDatabaseUseCase';
import { AnkifyExportScheduler } from '../services/ankify/AnkifyExportScheduler';
import { AnkifyExportSchedulesRepository } from '../data_layer/ankify/AnkifyExportSchedulesRepository';
import { getAnkifyExportScheduler } from '../lib/ankify/scheduler/instance';
import { Client as NotionClient } from '@notionhq/client';
import NotionRepository from '../data_layer/NotionRespository';
import StorageHandler from '../lib/storage/StorageHandler';
import { parseCollection } from '../services/ApkgPreviewService/parseCollection';
import RequireAnkifyAccess from './middleware/RequireAnkifyAccess';

const AnkifyRouter = () => {
  const router = express.Router();
  const db = getDatabase();
  const repo = new AnkifyClientsRepository(db);
  const mappings = new AnkifySyncMappingsRepository(db);
  const uploads = new UploadRepository(db);
  const schedulesRepo = new AnkifyExportSchedulesRepository(db);
  const logsRepo = new AnkifySyncLogsRepository(db);
  const subscriptionsRepo = new AnkifyNotionSubscriptionsRepository(db);
  const conflictsRepo = new AnkifySyncConflictsRepository(db);
  const docker = new Docker();
  const rac = new RacService(repo, docker);
  const storage = new StorageHandler();

  const fetchApkgBytes = async (key: string): Promise<Buffer> => {
    const data = await storage.getFileContents(key);
    const body = data.Body;
    if (body == null) {
      throw new Error(`APKG body missing for key ${key}`);
    }
    return Buffer.isBuffer(body) ? body : Buffer.from(body as Uint8Array);
  };

  const ankiConnectFactory = (host: string, port: number) =>
    new AnkiConnectClient(buildAnkiConnectUrl(host, port));

  const controller = new AnkifyController(
    new ProvisionAnkifyClientUseCase(rac),
    new ListAnkifyClientsUseCase(rac),
    new StopAnkifyClientUseCase(rac),
    new SendUploadToRacUseCase(
      repo,
      mappings,
      uploads,
      fetchApkgBytes,
      parseCollection,
      ankiConnectFactory,
      logsRepo
    ),
    new RespinAnkifyClientUseCase(rac),
    new ExportReviewDataToNotionUseCase(
      repo,
      new NotionRepository(db),
      ankiConnectFactory,
      (token) => {
        const notion = new NotionClient({ auth: token });
        const findFirstDataSourceId = async (
          databaseId: string
        ): Promise<string | null> => {
          const database = await notion.databases.retrieve({
            database_id: databaseId,
          });
          const dataSources =
            'data_sources' in database
              ? (database as { data_sources: { id: string }[] }).data_sources
              : [];
          return dataSources[0]?.id ?? null;
        };
        return {
          databases: {
            query: async (params) => {
              const dataSourceId = await findFirstDataSourceId(
                params.database_id
              );
              if (dataSourceId == null) {
                return { results: [] };
              }
              const res = await notion.dataSources.query({
                data_source_id: dataSourceId,
                filter: params.filter as never,
              });
              return { results: res.results };
            },
          },
          pages: {
            create: async (params) => {
              const databaseId = params.parent.database_id;
              const dataSourceId = await findFirstDataSourceId(databaseId);
              if (dataSourceId == null) {
                throw new Error(
                  'No data source found for the selected Notion database'
                );
              }
              return notion.pages.create({
                parent: {
                  type: 'data_source_id',
                  data_source_id: dataSourceId,
                },
                properties: params.properties,
              } as never);
            },
          },
          getSchema: async (databaseId) => {
            const dataSourceId = await findFirstDataSourceId(databaseId);
            if (dataSourceId == null) {
              return { properties: {} };
            }
            const dataSource = await notion.dataSources.retrieve({
              data_source_id: dataSourceId,
            });
            const properties =
              (dataSource as {
                properties?: Record<string, { type: string; name?: string }>;
              }).properties ?? {};
            return { properties };
          },
        };
      }
    ),
    new ConfigureExportScheduleUseCase(schedulesRepo, getAnkifyExportScheduler),
    new GetExportScheduleUseCase(schedulesRepo),
    new DeleteExportScheduleUseCase(schedulesRepo, getAnkifyExportScheduler),
    new ListSyncLogsUseCase(logsRepo),
    new SyncNotionPageToRacUseCase(
      repo,
      mappings,
      conflictsRepo,
      subscriptionsRepo,
      logsRepo,
      new NotionRepository(db),
      ankiConnectFactory,
      (token) => {
        const notion = new NotionClient({ auth: token });
        return async (blockId) => {
          const aggregated: unknown[] = [];
          let cursor: string | undefined;
          do {
            const response = await notion.blocks.children.list({
              block_id: blockId,
              page_size: 100,
              ...(cursor != null ? { start_cursor: cursor } : {}),
            });
            aggregated.push(...response.results);
            cursor = response.next_cursor ?? undefined;
          } while (cursor != null);
          return aggregated as never;
        };
      }
    ),
    new ListNotionSubscriptionsUseCase(subscriptionsRepo),
    new DeleteNotionSubscriptionUseCase(subscriptionsRepo),
    new ListConflictsUseCase(conflictsRepo),
    new ResolveConflictUseCase(
      repo,
      mappings,
      conflictsRepo,
      logsRepo,
      new NotionRepository(db),
      ankiConnectFactory,
      (token) => {
        const notion = new NotionClient({ auth: token });
        return {
          updateBlockContent: async (blockId, payload) => {
            await notion.blocks.update({
              block_id: blockId,
              toggle: {
                rich_text: [
                  { type: 'text', text: { content: payload.front } },
                ],
              },
            } as never);
            const children = await notion.blocks.children.list({
              block_id: blockId,
            });
            const firstParagraph = children.results.find(
              (b) => (b as { type: string }).type === 'paragraph'
            );
            if (firstParagraph != null) {
              await notion.blocks.update({
                block_id: (firstParagraph as { id: string }).id,
                paragraph: {
                  rich_text: [
                    { type: 'text', text: { content: payload.back } },
                  ],
                },
              } as never);
            }
          },
        };
      }
    ),
    new ListNotionDatabasesUseCase(new NotionRepository(db), {
      listDatabases: async (token) => {
        const notion = new NotionClient({ auth: token });
        const response = await notion.search({ page_size: 100 });

        type RawEntry = {
          id: string;
          title: string;
          url: string | null;
          has_review_shape: boolean;
          object: 'database' | 'data_source';
        };

        const raw: RawEntry[] = [];
        for (const entry of response.results) {
          const obj = (entry as { object?: string }).object;
          if (obj !== 'database' && obj !== 'data_source') {
            continue;
          }
          const titleArr = (entry as { title?: { plain_text?: string }[] })
            .title;
          const title =
            titleArr != null && titleArr.length > 0
              ? titleArr.map((t) => t.plain_text ?? '').join('')
              : '';
          const normalized = title.trim().toLowerCase();
          if (
            normalized.length === 0 ||
            normalized === 'untitled' ||
            normalized === 'untitled database'
          ) {
            continue;
          }
          const properties =
            (entry as { properties?: Record<string, { type: string }> })
              .properties ?? {};
          const hasReviewShape =
            properties.Date?.type === 'date' &&
            properties.Reviews?.type === 'number';
          raw.push({
            id: (entry as { id: string }).id,
            title,
            url: (entry as { url?: string }).url ?? null,
            has_review_shape: hasReviewShape,
            object: obj,
          });
        }

        const byNormalizedTitle = new Map<string, RawEntry>();
        for (const entry of raw) {
          const key = entry.title.trim().toLowerCase();
          const existing = byNormalizedTitle.get(key);
          if (existing == null) {
            byNormalizedTitle.set(key, entry);
            continue;
          }
          if (
            existing.object === 'data_source' &&
            entry.object === 'database'
          ) {
            byNormalizedTitle.set(key, entry);
          }
        }

        return Array.from(byNormalizedTitle.values()).map((entry) => ({
          id: entry.id,
          title: entry.title,
          url: entry.url,
          has_review_shape: entry.has_review_shape,
        }));
      },
    }),
    new CreateReviewTrackerDatabaseUseCase(new NotionRepository(db), {
      createReviewTracker: async (token, input) => {
        const notion = new NotionClient({ auth: token });
        const response = await notion.databases.create({
          parent: { type: 'page_id', page_id: input.parentPageId },
          title: [{ type: 'text', text: { content: input.title } }],
          initial_data_source: {
            properties: {
              Name: { title: {} },
              Date: { date: {} },
              Reviews: { number: { format: 'number' } },
            },
          },
        } as never);
        return {
          id: (response as { id: string }).id,
          url: (response as { url?: string }).url ?? null,
          title: input.title,
        };
      },
    })
  );

  /**
   * @swagger
   * /api/ankify/clients:
   *   get:
   *     summary: List the requesting user's hosted Anki clients
   *     description: Allowlisted endpoint. Returns active and inactive Remote Anki Client records belonging to the authenticated user.
   *     tags: [Ankify]
   *     responses:
   *       200:
   *         description: Clients listed
   *       401:
   *         description: Authentication required
   *       403:
   *         description: User is not on the ankify allowlist
   */
  router.get('/api/ankify/clients', RequireAnkifyAccess, (req, res) =>
    controller.list(req, res)
  );

  /**
   * @swagger
   * /api/ankify/clients:
   *   post:
   *     summary: Provision a new hosted Anki client
   *     description: Allowlisted endpoint. Allocates host ports and starts a remote-anki-client container for the authenticated user.
   *     tags: [Ankify]
   *     responses:
   *       201:
   *         description: Client provisioned
   *       401:
   *         description: Authentication required
   *       403:
   *         description: User is not on the ankify allowlist
   *       503:
   *         description: Docker daemon unavailable or no available host ports
   */
  router.post('/api/ankify/clients', RequireAnkifyAccess, (req, res) =>
    controller.provision(req, res)
  );

  /**
   * @swagger
   * /api/ankify/clients/{id}:
   *   delete:
   *     summary: Stop and clean up a hosted Anki client
   *     description: Allowlisted endpoint. Stops the underlying container and marks the client inactive.
   *     tags: [Ankify]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Client stopped
   *       400:
   *         description: Invalid client id
   *       401:
   *         description: Authentication required
   *       403:
   *         description: User is not on the ankify allowlist
   */
  router.delete('/api/ankify/clients/:id', RequireAnkifyAccess, (req, res) =>
    controller.stop(req, res)
  );

  /**
   * @swagger
   * /api/ankify/dispatch:
   *   post:
   *     summary: Send an existing APKG upload to the user's hosted Anki client
   *     description: Allowlisted endpoint. Reads the upload's APKG, parses notes, and dispatches them via AnkiConnect into the active Ankify client. Idempotent — a second call updates rather than duplicates, keyed off ankify_sync_mappings.
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [upload_id]
   *             properties:
   *               upload_id:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Dispatched
   *       400:
   *         description: Missing or invalid upload_id
   *       404:
   *         description: Upload not found for this user
   *       409:
   *         description: No active Ankify client
   *       503:
   *         description: AnkiConnect unreachable
   */
  router.post('/api/ankify/dispatch', RequireAnkifyAccess, (req, res) =>
    controller.sendUpload(req, res)
  );

  /**
   * @swagger
   * /api/ankify/clients/respin:
   *   post:
   *     summary: Stop the active hosted Anki container and start a fresh one
   *     description: Allowlisted endpoint. The named volume backing the user's collection is preserved, so the new container has the same data.
   *     tags: [Ankify]
   *     responses:
   *       200:
   *         description: Respun
   *       503:
   *         description: Docker daemon unavailable or no available host ports
   */
  router.post('/api/ankify/clients/respin', RequireAnkifyAccess, (req, res) =>
    controller.respin(req, res)
  );

  /**
   * @swagger
   * /api/ankify/exports/review-data:
   *   post:
   *     summary: Export Anki review counts into a Notion database
   *     description: Allowlisted endpoint. Pulls the per-day review history from the active hosted Anki via AnkiConnect and writes one row per day into the user-supplied Notion database (skipping dates already present).
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [database_id]
   *             properties:
   *               database_id:
   *                 type: string
   *               date_range_days:
   *                 type: integer
   *                 description: Restrict to the trailing N days of history.
   *     responses:
   *       200:
   *         description: Export summary
   *       409:
   *         description: No active Ankify client or Notion not connected
   *       503:
   *         description: AnkiConnect unreachable
   */
  router.post(
    '/api/ankify/exports/review-data',
    RequireAnkifyAccess,
    (req, res) => controller.exportReviewData(req, res)
  );

  /**
   * @swagger
   * /api/ankify/exports/schedule:
   *   get:
   *     summary: Read the user's daily review-export schedule
   *     tags: [Ankify]
   *   post:
   *     summary: Create or update the user's daily review-export schedule
   *     description: Allowlisted endpoint. Schedules a daily run at the supplied IANA timezone-local time.
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [database_id, time_of_day, timezone]
   *             properties:
   *               database_id:
   *                 type: string
   *               time_of_day:
   *                 type: string
   *                 example: "09:00"
   *               timezone:
   *                 type: string
   *                 example: "Europe/Oslo"
   *               date_range_days:
   *                 type: integer
   *               enabled:
   *                 type: boolean
   *   delete:
   *     summary: Cancel and remove the user's daily review-export schedule
   *     tags: [Ankify]
   */
  router.get(
    '/api/ankify/exports/schedule',
    RequireAnkifyAccess,
    (req, res) => controller.getSchedule(req, res)
  );
  router.post(
    '/api/ankify/exports/schedule',
    RequireAnkifyAccess,
    (req, res) => controller.configureSchedule(req, res)
  );
  router.delete(
    '/api/ankify/exports/schedule',
    RequireAnkifyAccess,
    (req, res) => controller.deleteSchedule(req, res)
  );

  /**
   * @swagger
   * /api/ankify/sync-logs:
   *   get:
   *     summary: Recent ankify sync events for the user (newest first)
   *     description: Allowlisted endpoint. Optional query params `limit` (default 100) and `status` (success|error|info).
   *     tags: [Ankify]
   */
  router.get('/api/ankify/sync-logs', RequireAnkifyAccess, (req, res) =>
    controller.listSyncLogs(req, res)
  );

  /**
   * @swagger
   * /api/ankify/subscriptions:
   *   get:
   *     summary: List Notion pages auto-synced into the user's hosted Anki
   *     tags: [Ankify]
   *   post:
   *     summary: Subscribe a Notion page (kicks off an immediate sync)
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [notion_page_id]
   *             properties:
   *               notion_page_id:
   *                 type: string
   */
  router.get('/api/ankify/subscriptions', RequireAnkifyAccess, (req, res) =>
    controller.listSubscriptions(req, res)
  );
  router.post('/api/ankify/subscriptions', RequireAnkifyAccess, (req, res) =>
    controller.subscribeNotionPage(req, res)
  );
  router.delete(
    '/api/ankify/subscriptions/:id',
    RequireAnkifyAccess,
    (req, res) => controller.deleteSubscription(req, res)
  );

  /**
   * @swagger
   * /api/ankify/conflicts:
   *   get:
   *     summary: List sync conflicts (pending by default)
   *     tags: [Ankify]
   * /api/ankify/conflicts/{id}/resolve:
   *   post:
   *     summary: Resolve a conflict
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [resolution]
   *             properties:
   *               resolution:
   *                 type: string
   *                 enum: [keep_notion, keep_anki, dismissed]
   */
  router.get('/api/ankify/conflicts', RequireAnkifyAccess, (req, res) =>
    controller.listConflicts(req, res)
  );
  router.post(
    '/api/ankify/conflicts/:id/resolve',
    RequireAnkifyAccess,
    (req, res) => controller.resolveConflict(req, res)
  );

  /**
   * @swagger
   * /api/ankify/notion/databases:
   *   get:
   *     summary: List the user's Notion databases
   *     description: Allowlisted endpoint. Returns each database with a `has_review_shape` flag (true when it already has Date + Reviews properties suitable for the review export).
   *     tags: [Ankify]
   *   post:
   *     summary: Create a new "Anki review tracker" Notion database under a parent page
   *     description: Allowlisted endpoint. Creates a database with Date (date) and Reviews (number) properties, ready to use as the review-export target.
   *     tags: [Ankify]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [parent_page_id]
   *             properties:
   *               parent_page_id:
   *                 type: string
   *               title:
   *                 type: string
   */
  router.get(
    '/api/ankify/notion/databases',
    RequireAnkifyAccess,
    (req, res) => controller.listNotionDatabases(req, res)
  );
  router.post(
    '/api/ankify/notion/databases',
    RequireAnkifyAccess,
    (req, res) => controller.createReviewTracker(req, res)
  );

  return router;
};

export default AnkifyRouter;
