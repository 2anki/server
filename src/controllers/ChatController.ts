import { Request, Response } from 'express';
import { ChatUseCase, ChatRateLimitError } from '../usecases/chat/ChatUseCase';

const MAX_CONTENT_LENGTH = 4000;

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const result = await this.chatUseCase.execute({
        user: { owner, patreon },
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
