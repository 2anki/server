import { Request, Response } from 'express';

import ProvisionAnkifyClientUseCase from '../usecases/ankify/ProvisionAnkifyClientUseCase';
import ListAnkifyClientsUseCase from '../usecases/ankify/ListAnkifyClientsUseCase';
import StopAnkifyClientUseCase from '../usecases/ankify/StopAnkifyClientUseCase';
import {
  DockerUnavailableError,
  NoAvailablePortError,
} from '../services/ankify/RacService';

class AnkifyController {
  constructor(
    private readonly provisionUseCase: ProvisionAnkifyClientUseCase,
    private readonly listUseCase: ListAnkifyClientsUseCase,
    private readonly stopUseCase: StopAnkifyClientUseCase
  ) {}

  async list(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const clients = await this.listUseCase.execute(owner);
    res.json(clients);
  }

  async provision(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    try {
      const client = await this.provisionUseCase.execute(owner);
      res.status(201).json(client);
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
}

export default AnkifyController;
