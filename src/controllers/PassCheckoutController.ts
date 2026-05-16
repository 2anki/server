import { Request, Response } from 'express';
import { CreatePassCheckoutUseCase } from '../usecases/checkout/CreatePassCheckoutUseCase';

class PassCheckoutController {
  constructor(private readonly useCase: CreatePassCheckoutUseCase) {}

  async createSession(_req: Request, res: Response): Promise<void> {
    const userId = res.locals.owner as number;
    const userEmail = res.locals.email as string;

    const result = await this.useCase.execute({ userId, userEmail });
    res.json(result);
  }
}

export default PassCheckoutController;
