import { Request, Response } from 'express';

import ProvisionAnkifyClientUseCase from '../usecases/ankify/ProvisionAnkifyClientUseCase';
import ListAnkifyClientsUseCase from '../usecases/ankify/ListAnkifyClientsUseCase';
import StopAnkifyClientUseCase from '../usecases/ankify/StopAnkifyClientUseCase';
import {
  NoActiveAnkifyClientError,
  SendUploadToRacUseCase,
  UploadNotFoundError,
} from '../usecases/ankify/SendUploadToRacUseCase';
import {
  DockerUnavailableError,
  NoAvailablePortError,
} from '../services/ankify/RacService';
import { AnkiConnectUnreachableError } from '../services/ankify/AnkiConnectClient';

class AnkifyController {
  constructor(
    private readonly provisionUseCase: ProvisionAnkifyClientUseCase,
    private readonly listUseCase: ListAnkifyClientsUseCase,
    private readonly stopUseCase: StopAnkifyClientUseCase,
    private readonly sendUploadUseCase: SendUploadToRacUseCase
  ) {}

  async list(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const clients = await this.listUseCase.execute(owner);
    res.json(clients);
  }

  async provision(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    try {
      const { client, created } = await this.provisionUseCase.execute(owner);
      res.status(created ? 201 : 200).json(client);
    } catch (error) {
      if (error instanceof DockerUnavailableError) {
        res
          .status(503)
          .json({ message: 'Docker daemon is unavailable on this host' });
        return;
      }
      if (error instanceof NoAvailablePortError) {
        res.status(503).json({ message: 'No available host ports' });
        return;
      }
      throw error;
    }
  }

  async stop(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Invalid client id' });
      return;
    }
    await this.stopUseCase.execute(id, owner);
    res.status(204).send();
  }

  async sendUpload(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const uploadId = Number.parseInt(req.body?.upload_id, 10);
    if (!Number.isFinite(uploadId)) {
      res.status(400).json({ message: 'upload_id is required' });
      return;
    }

    try {
      const result = await this.sendUploadUseCase.execute({
        uploadId,
        owner,
      });
      res.status(200).json({
        deck_names: result.deckNames,
        created: result.created,
        updated: result.updated,
        errors: result.errors,
      });
    } catch (error) {
      if (error instanceof UploadNotFoundError) {
        res.status(404).json({ message: 'Upload not found' });
        return;
      }
      if (error instanceof NoActiveAnkifyClientError) {
        res.status(409).json({
          message:
            'No active Ankify client. Provision one before sending uploads.',
        });
        return;
      }
      if (error instanceof AnkiConnectUnreachableError) {
        res.status(503).json({
          message:
            'AnkiConnect is unreachable. Make sure the hosted Anki container is healthy.',
        });
        return;
      }
      throw error;
    }
  }
}

export default AnkifyController;
