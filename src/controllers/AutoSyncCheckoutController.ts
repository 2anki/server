import { Request, Response } from 'express';
import { AutoSyncCheckoutUseCase } from '../usecases/checkout/AutoSyncCheckoutUseCase';

class AutoSyncCheckoutController {
  constructor(private readonly useCase: AutoSyncCheckoutUseCase) {}

  async createSession(_req: Request, res: Response): Promise<void> {
    const userId = res.locals.owner as number;
    const userEmail = res.locals.email as string;

    const result = await this.useCase.execute({ userId, userEmail });
    res.json(result);
  }
}

export default AutoSyncCheckoutController;
