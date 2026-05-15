import { Request, Response } from 'express';
import { fromBuffer as fileTypeFromBuffer } from 'file-type';
import {
  ChatUseCase,
  ChatRateLimitError,
  ChatConversationNotFoundError,
} from '../usecases/chat/ChatUseCase';
import type { ChatAttachment } from '../usecases/chat/buildAttachmentBlocks';
import { getSafeFilename } from '../lib/getSafeFilename';

const MAX_CONTENT_LENGTH = 4000;
const MAX_CONTENT_LENGTH_PREMIUM = 100_000;
const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

function sseWrite(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function parseConversationId(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number' && Number.isSafeInteger(raw) && raw > 0) return raw;
  if (typeof raw === 'string' && /^[1-9]\d*$/.test(raw)) {
    const n = Number(raw);
    return Number.isSafeInteger(n) ? n : null;
  }
  return null;
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

    const rawFiles = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];

    if (rawFiles.length > MAX_FILE_COUNT) {
      res.status(400).json({ error: `Too many files. Maximum is ${MAX_FILE_COUNT} per message.` });
      return;
    }

    for (const file of rawFiles) {
      if (file.size > MAX_FILE_SIZE) {
        const safeName = getSafeFilename(file.originalname);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        res.status(400).json({
          error: `${safeName} is ${sizeMB} MB. The per-file limit is 10 MB.`,
        });
        return;
      }

      if (!ALLOWED_MIMES.has(file.mimetype)) {
        const safeName = getSafeFilename(file.originalname);
        res.status(400).json({
          error: `Can't attach ${safeName}. Only PDF and image files work here.`,
        });
        return;
      }
    }

    const totalSize = rawFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      const totalMB = (totalSize / (1024 * 1024)).toFixed(1);
      res.status(400).json({
        error: `That's ${totalMB} MB total. A message can carry up to 25 MB across all files.`,
      });
      return;
    }

    const attachments: ChatAttachment[] = [];
    for (const file of rawFiles) {
      const detected = await fileTypeFromBuffer(file.buffer);
      if (detected == null || detected.mime !== file.mimetype) {
        const safeName = getSafeFilename(file.originalname);
        res.status(400).json({
          error: `Can't attach ${safeName}. Only PDF and image files work here.`,
        });
        return;
      }
      attachments.push({ mimeType: file.mimetype, data: file.buffer });
    }

    const conversationId = parseConversationId(req.body?.conversationId);

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
        conversationId,
        attachments,
        onToken: (text) => sseWrite(res, 'token', text),
      });

      sseWrite(res, 'done', {
        content: result.content,
        conversationId: result.conversationId,
        ...(result.cards != null ? { cards: result.cards } : {}),
        ...(result.contentBefore != null ? { contentBefore: result.contentBefore } : {}),
        ...(result.contentAfter != null ? { contentAfter: result.contentAfter } : {}),
      });
    } catch (err) {
      if (err instanceof ChatRateLimitError) {
        sseWrite(res, 'error', { type: 'rate_limit', resetDate: err.resetDate });
      } else if (err instanceof ChatConversationNotFoundError) {
        sseWrite(res, 'error', { type: 'conversation_not_found' });
      } else {
        sseWrite(res, 'error', { type: 'server_error' });
      }
    } finally {
      res.end();
    }
  }
}

export default ChatController;
