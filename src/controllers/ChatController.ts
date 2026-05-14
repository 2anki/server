import { Request, Response } from 'express';
import { ChatUseCase, ChatRateLimitError } from '../usecases/chat/ChatUseCase';

const MAX_CONTENT_LENGTH = 4000;
const MAX_CONTENT_LENGTH_PREMIUM = 100_000;

function sseWrite(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

class ChatController {
  constructor(private readonly chatUseCase: ChatUseCase) {}

  async sendMessage(req: Request, res: Response) {
    const rawContent = req.body?.content;
    const content = typeof rawContent === 'string' ? rawContent.trim() : '';

    if (content.length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    const owner = res.locals.owner as number;
    const patreon = (res.locals.patreon as boolean) ?? false;
    const subscriber = (res.locals.subscriber as boolean) ?? false;
    const isPremium = patreon || subscriber;
    const contentLimit = isPremium ? MAX_CONTENT_LENGTH_PREMIUM : MAX_CONTENT_LENGTH;

    if (content.length > contentLimit) {
      res.status(400).json({ error: `content must be ${contentLimit} characters or fewer` });
      return;
    }

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const result = await this.chatUseCase.execute({
        user: { owner, patreon: isPremium },
        content,
        conversationHistory,
        onToken: (text) => sseWrite(res, 'token', text),
      });

      sseWrite(res, 'done', {
        content: result.content,
        ...(result.cards != null ? { cards: result.cards } : {}),
        ...(result.contentBefore != null ? { contentBefore: result.contentBefore } : {}),
        ...(result.contentAfter != null ? { contentAfter: result.contentAfter } : {}),
      });
    } catch (err) {
      if (err instanceof ChatRateLimitError) {
        sseWrite(res, 'error', { type: 'rate_limit', resetDate: err.resetDate });
      } else {
        sseWrite(res, 'error', { type: 'server_error' });
      }
    } finally {
      res.end();
    }
  }
}

export default ChatController;
