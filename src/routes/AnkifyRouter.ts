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
import { SendUploadToRacUseCase } from '../usecases/ankify/SendUploadToRacUseCase';
import StorageHandler from '../lib/storage/StorageHandler';
import { parseCollection } from '../services/ApkgPreviewService/parseCollection';
import RequireAnkifyAccess from './middleware/RequireAnkifyAccess';

const AnkifyRouter = () => {
  const router = express.Router();
  const db = getDatabase();
  const repo = new AnkifyClientsRepository(db);
  const mappings = new AnkifySyncMappingsRepository(db);
  const uploads = new UploadRepository(db);
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
    )
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

  return router;
};

export default AnkifyRouter;
