import { Request, Response } from 'express';

import ProvisionAnkifyClientUseCase from '../usecases/ankify/ProvisionAnkifyClientUseCase';
import ListAnkifyClientsUseCase from '../usecases/ankify/ListAnkifyClientsUseCase';
import StopAnkifyClientUseCase from '../usecases/ankify/StopAnkifyClientUseCase';
import RespinAnkifyClientUseCase from '../usecases/ankify/RespinAnkifyClientUseCase';
import {
  NoActiveAnkifyClientError,
  SendUploadToRacUseCase,
  UploadNotFoundError,
} from '../usecases/ankify/SendUploadToRacUseCase';
import {
  ExportReviewDataToNotionUseCase,
  NotionNotConnectedError,
} from '../usecases/ankify/ExportReviewDataToNotionUseCase';
import {
  ConfigureExportScheduleUseCase,
  InvalidScheduleTimeError,
  InvalidTimezoneError,
} from '../usecases/ankify/ConfigureExportScheduleUseCase';
import { GetExportScheduleUseCase } from '../usecases/ankify/GetExportScheduleUseCase';
import { DeleteExportScheduleUseCase } from '../usecases/ankify/DeleteExportScheduleUseCase';
import { ListSyncLogsUseCase } from '../usecases/ankify/ListSyncLogsUseCase';
import { SyncNotionPageToRacUseCase } from '../usecases/ankify/SyncNotionPageToRacUseCase';
import { ListNotionSubscriptionsUseCase } from '../usecases/ankify/ListNotionSubscriptionsUseCase';
import { DeleteNotionSubscriptionUseCase } from '../usecases/ankify/DeleteNotionSubscriptionUseCase';
import { ListConflictsUseCase } from '../usecases/ankify/ListConflictsUseCase';
import {
  ConflictNotFoundError,
  ResolveConflictUseCase,
} from '../usecases/ankify/ResolveConflictUseCase';
import { AnkifyConflictResolution } from '../entities/ankify';
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
    private readonly sendUploadUseCase: SendUploadToRacUseCase,
    private readonly respinUseCase: RespinAnkifyClientUseCase,
    private readonly exportReviewDataUseCase: ExportReviewDataToNotionUseCase,
    private readonly configureScheduleUseCase: ConfigureExportScheduleUseCase,
    private readonly getScheduleUseCase: GetExportScheduleUseCase,
    private readonly deleteScheduleUseCase: DeleteExportScheduleUseCase,
    private readonly listSyncLogsUseCase: ListSyncLogsUseCase,
    private readonly syncNotionPageUseCase: SyncNotionPageToRacUseCase,
    private readonly listSubscriptionsUseCase: ListNotionSubscriptionsUseCase,
    private readonly deleteSubscriptionUseCase: DeleteNotionSubscriptionUseCase,
    private readonly listConflictsUseCase: ListConflictsUseCase,
    private readonly resolveConflictUseCase: ResolveConflictUseCase
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

  async respin(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    try {
      const { client } = await this.respinUseCase.execute(owner);
      res.status(200).json(client);
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

  async exportReviewData(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const databaseId = String(req.body?.database_id ?? '').trim();
    if (databaseId.length === 0) {
      res.status(400).json({ message: 'database_id is required' });
      return;
    }
    const dateRangeDays =
      req.body?.date_range_days != null
        ? Number(req.body.date_range_days)
        : undefined;

    try {
      const result = await this.exportReviewDataUseCase.execute({
        owner,
        databaseId,
        dateRangeDays,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof NoActiveAnkifyClientError) {
        res.status(409).json({
          message:
            'No active Ankify client. Provision one before exporting review data.',
        });
        return;
      }
      if (error instanceof NotionNotConnectedError) {
        res.status(409).json({ message: 'Notion is not connected' });
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

  async getSchedule(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const schedule = await this.getScheduleUseCase.execute(owner);
    res.status(200).json(schedule);
  }

  async configureSchedule(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const databaseId = String(req.body?.database_id ?? '').trim();
    const timeOfDay = String(req.body?.time_of_day ?? '').trim();
    const timezone = String(req.body?.timezone ?? '').trim();
    const enabled = req.body?.enabled !== false;
    const dateRangeDays =
      req.body?.date_range_days != null
        ? Number(req.body.date_range_days)
        : null;

    if (databaseId.length === 0) {
      res.status(400).json({ message: 'database_id is required' });
      return;
    }
    if (timeOfDay.length === 0) {
      res.status(400).json({ message: 'time_of_day is required (HH:MM)' });
      return;
    }
    if (timezone.length === 0) {
      res.status(400).json({ message: 'timezone is required (IANA name)' });
      return;
    }

    try {
      const schedule = await this.configureScheduleUseCase.execute({
        owner,
        databaseId,
        timeOfDay,
        timezone,
        dateRangeDays,
        enabled,
      });
      res.status(200).json(schedule);
    } catch (error) {
      if (
        error instanceof InvalidScheduleTimeError ||
        error instanceof InvalidTimezoneError
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  async deleteSchedule(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    await this.deleteScheduleUseCase.execute(owner);
    res.status(204).send();
  }

  async listSubscriptions(_req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const subs = await this.listSubscriptionsUseCase.execute(owner);
    res.status(200).json(subs);
  }

  async subscribeNotionPage(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const notionPageId = String(req.body?.notion_page_id ?? '').trim();
    if (notionPageId.length === 0) {
      res.status(400).json({ message: 'notion_page_id is required' });
      return;
    }
    try {
      const result = await this.syncNotionPageUseCase.execute({
        owner,
        notionPageId,
        trigger: 'manual',
      });
      res.status(200).json({
        subscription: result.subscription,
        created: result.created,
        updated: result.updated,
        conflicts: result.conflicts,
        unchanged: result.unchanged,
        errors: result.errors,
        anki_web_sync: result.ankiWebSync,
        anki_web_sync_error: result.ankiWebSyncError,
      });
    } catch (error) {
      if (error instanceof NoActiveAnkifyClientError) {
        res.status(409).json({
          message:
            'No active Ankify client. Provision one before subscribing.',
        });
        return;
      }
      if (error instanceof NotionNotConnectedError) {
        res.status(409).json({ message: 'Notion is not connected' });
        return;
      }
      if (error instanceof AnkiConnectUnreachableError) {
        res.status(503).json({
          message: 'AnkiConnect is unreachable.',
        });
        return;
      }
      throw error;
    }
  }

  async deleteSubscription(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Invalid subscription id' });
      return;
    }
    await this.deleteSubscriptionUseCase.execute(id, owner);
    res.status(204).send();
  }

  async listConflicts(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const status =
      req.query.status != null ? String(req.query.status) : undefined;
    const conflicts = await this.listConflictsUseCase.execute(owner, {
      status,
    });
    res.status(200).json(conflicts);
  }

  async resolveConflict(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: 'Invalid conflict id' });
      return;
    }
    const resolution = String(
      req.body?.resolution ?? 'dismissed'
    ) as AnkifyConflictResolution;
    if (
      resolution !== 'keep_notion' &&
      resolution !== 'keep_anki' &&
      resolution !== 'dismissed'
    ) {
      res.status(400).json({
        message: 'resolution must be keep_notion, keep_anki, or dismissed',
      });
      return;
    }
    try {
      await this.resolveConflictUseCase.execute({
        id,
        owner,
        resolution,
      });
      res.status(204).send();
    } catch (error) {
      if (error instanceof ConflictNotFoundError) {
        res.status(404).json({ message: 'Conflict not found' });
        return;
      }
      throw error;
    }
  }

  async listSyncLogs(req: Request, res: Response) {
    const owner = res.locals.owner as number;
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    const status =
      req.query.status != null ? String(req.query.status) : undefined;
    const logs = await this.listSyncLogsUseCase.execute(owner, {
      limit,
      status,
    });
    res.status(200).json(logs);
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
        anki_web_sync: result.ankiWebSync,
        anki_web_sync_error: result.ankiWebSyncError,
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
