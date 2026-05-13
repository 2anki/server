import { Request, Response } from 'express';

import type { IEmailPreferencesRepository } from '../data_layer/EmailPreferencesRepository';
import { UpdateEmailPreferencesUseCase } from '../usecases/UpdateEmailPreferencesUseCase';

export class EmailPreferencesController {
  private readonly updatePrefsUseCase: UpdateEmailPreferencesUseCase;

  constructor(private readonly prefRepo: IEmailPreferencesRepository) {
    this.updatePrefsUseCase = new UpdateEmailPreferencesUseCase(prefRepo);
  }

  async get(_req: Request, res: Response): Promise<void> {
    const userId = res.locals.owner as number;
    const marketingOptOut = await this.prefRepo.isOptedOut(userId);
    res.status(200).json({ marketingOptOut });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { marketingOptOut } = req.body;
    if (typeof marketingOptOut !== 'boolean') {
      res.status(400).json({ message: 'marketingOptOut must be a boolean.' });
      return;
    }

    const userId = res.locals.owner as number;
    await this.updatePrefsUseCase.execute({ userId, marketingOptOut });
    res.status(200).json({ message: 'Email preferences updated.' });
  }
}
