import { Request, Response } from 'express';
import type { SetChatConsentUseCase } from '../usecases/chat/SetChatConsentUseCase';

class ChatConsentController {
  constructor(private readonly useCase: SetChatConsentUseCase) {}

  async recordConsent(_req: Request, res: Response): Promise<void> {
    const owner = res.locals.owner as number;
    await this.useCase.execute(owner);
    res.sendStatus(204);
  }
}

export default ChatConsentController;
