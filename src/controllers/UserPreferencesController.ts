import { Request, Response } from 'express';

import type { IUserPreferencesRepository } from '../data_layer/UserPreferencesRepository';
import { GetUserPreferencesUseCase } from '../usecases/GetUserPreferencesUseCase';
import { PatchUserPreferencesUseCase } from '../usecases/PatchUserPreferencesUseCase';
import { MigrateUserPreferencesUseCase } from '../usecases/MigrateUserPreferencesUseCase';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class UserPreferencesController {
  private readonly getUseCase: GetUserPreferencesUseCase;
  private readonly patchUseCase: PatchUserPreferencesUseCase;
  private readonly migrateUseCase: MigrateUserPreferencesUseCase;

  constructor(repo: IUserPreferencesRepository) {
    this.getUseCase = new GetUserPreferencesUseCase(repo);
    this.patchUseCase = new PatchUserPreferencesUseCase(repo);
    this.migrateUseCase = new MigrateUserPreferencesUseCase(repo);
  }

  async get(_req: Request, res: Response): Promise<void> {
    const userId = res.locals.owner as number;
    const prefs = await this.getUseCase.execute(userId);
    res.status(200).json(prefs);
  }

  async patch(req: Request, res: Response): Promise<void> {
    const { cardOptions, theme, ankiWebAcknowledgedAt } = req.body;

    if (cardOptions !== undefined && !isPlainObject(cardOptions)) {
      res.status(400).json({ message: 'cardOptions must be an object.' });
      return;
    }
    if (theme !== undefined && typeof theme !== 'string') {
      res.status(400).json({ message: 'theme must be a string.' });
      return;
    }
    if (ankiWebAcknowledgedAt !== undefined && typeof ankiWebAcknowledgedAt !== 'string') {
      res.status(400).json({ message: 'ankiWebAcknowledgedAt must be a string.' });
      return;
    }

    const userId = res.locals.owner as number;
    const prefs = await this.patchUseCase.execute({ userId, cardOptions, theme, ankiWebAcknowledgedAt });
    res.status(200).json(prefs);
  }

  async migrate(req: Request, res: Response): Promise<void> {
    const { cardOptions, theme, ankiWebAcknowledgedAt } = req.body;

    if (cardOptions !== undefined && !isPlainObject(cardOptions)) {
      res.status(400).json({ message: 'cardOptions must be an object.' });
      return;
    }
    if (theme !== undefined && typeof theme !== 'string') {
      res.status(400).json({ message: 'theme must be a string.' });
      return;
    }
    if (ankiWebAcknowledgedAt !== undefined && typeof ankiWebAcknowledgedAt !== 'string') {
      res.status(400).json({ message: 'ankiWebAcknowledgedAt must be a string.' });
      return;
    }

    const userId = res.locals.owner as number;
    const prefs = await this.migrateUseCase.execute({ userId, cardOptions, theme, ankiWebAcknowledgedAt });
    res.status(200).json(prefs);
  }
}
