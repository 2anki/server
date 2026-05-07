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
      ankiConnectFactory
    ),
    new RespinAnkifyClientUseCase(rac),
    new ExportReviewDataToNotionUseCase(
      repo,
      new NotionRepository(db),
      ankiConnectFactory,
      (token) => {
        const notion = new NotionClient({ auth: token });
        return {
          databases: {
            query: async (params) => {
              const database = await notion.databases.retrieve({
                database_id: params.database_id,
              });
              const dataSources =
                'data_sources' in database
                  ? (database as { data_sources: { id: string }[] }).data_sources
                  : [];
              const aggregated: { results: unknown[] } = { results: [] };
              for (const ds of dataSources) {
                const res = await notion.dataSources.query({
                  data_source_id: ds.id,
                  filter: params.filter as never,
                });
                aggregated.results.push(...res.results);
              }
              return aggregated;
            },
          },
          pages: {
            create: (params) =>
              notion.pages.create(
                params as Parameters<typeof notion.pages.create>[0]
              ),
          },
        };
      }
    ),
    new ConfigureExportScheduleUseCase(schedulesRepo, getAnkifyExportScheduler),
    new GetExportScheduleUseCase(schedulesRepo),
    new DeleteExportScheduleUseCase(schedulesRepo, getAnkifyExportScheduler)
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

  return router;
};

export default AnkifyRouter;
