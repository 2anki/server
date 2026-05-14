import { Request, Response } from 'express';
import { ChatUseCase, ChatRateLimitError } from '../usecases/chat/ChatUseCase';

const MAX_CONTENT_LENGTH = 4000;

class ChatController {
  constructor(private readonly chatUseCase: ChatUseCase) {}

  async sendMessage(req: Request, res: Response) {
    const rawContent = req.body?.content;
    const content = typeof rawContent === 'string' ? rawContent.trim() : '';

    if (content.length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      res.status(400).json({ error: `content must be ${MAX_CONTENT_LENGTH} characters or fewer` });
      return;
    }

    const owner = res.locals.owner as number;
    const patreon = (res.locals.patreon as boolean) ?? false;

    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const conversationHistory = rawHistory
      .filter(
        (m: unknown): m is { role: 'user' | 'assistant'; content: string } =>
          m != null &&
          typeof m === 'object' &&
          ((m as Record<string, unknown>).role === 'user' ||
            (m as Record<string, unknown>).role === 'assistant') &&
          typeof (m as Record<string, unknown>).content === 'string'
      )
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content }));

    try {
      const result = await this.chatUseCase.execute({
        user: { owner, patreon },
        content,
        conversationHistory,
      });

      res.status(200).json({
        role: 'assistant',
        content: result.content,
        ...(result.contentBefore != null ? { contentBefore: result.contentBefore } : {}),
        ...(result.contentAfter != null ? { contentAfter: result.contentAfter } : {}),
        ...(result.cards != null ? { cards: result.cards } : {}),
      });
    } catch (err) {
      if (err instanceof ChatRateLimitError) {
        res.status(429).json({ error: 'Message limit reached', resetDate: err.resetDate });
        return;
      }
      throw err;
    }
  }
}

export default ChatController;
