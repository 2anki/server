import { Request, Response } from 'express';
import ChatController from './ChatController';
import {
  ChatRateLimitError,
  ChatConversationNotFoundError,
} from '../usecases/chat/ChatUseCase';

function buildRes(owner = 42, patreon = false, subscriber = false): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    locals: { owner, patreon, subscriber },
  } as unknown as Response;
}

function buildMocks(owner = 42, patreon = false, subscriber = false) {
  const execute = jest.fn();
  const controller = new ChatController({ execute } as never);
  const res = buildRes(owner, patreon, subscriber);
  return { execute, controller, res };
}

function buildReq(body: unknown): Request {
  return { body } as unknown as Request;
}

function writtenEvents(res: Response): Array<{ event: string; data: unknown }> {
  const calls = (res.write as jest.Mock).mock.calls as Array<[string]>;
  return calls.map(([raw]) => {
    const eventMatch = /^event: (.+)$/m.exec(raw);
    const dataMatch = /^data: (.+)$/m.exec(raw);
    return {
      event: eventMatch?.[1] ?? '',
      data: dataMatch != null ? JSON.parse(dataMatch[1]) : null,
    };
  });
}

describe('ChatController.sendMessage', () => {
  it('returns 400 when content is missing', async () => {
    const { controller, res } = buildMocks();
    await controller.sendMessage(buildReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when content is empty string', async () => {
    const { controller, res } = buildMocks();
    await controller.sendMessage(buildReq({ content: '' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when content exceeds 4000 chars for free users', async () => {
    const { controller, res } = buildMocks();
    await controller.sendMessage(buildReq({ content: 'x'.repeat(4001) }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('allows content up to 100 000 chars for patreon users', async () => {
    const { execute, controller, res } = buildMocks(42, true, false);
    execute.mockResolvedValueOnce({ content: 'ok' });
    await controller.sendMessage(buildReq({ content: 'x'.repeat(100_000) }), res);
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(execute).toHaveBeenCalled();
  });

  it('allows content up to 100 000 chars for subscriber users', async () => {
    const { execute, controller, res } = buildMocks(42, false, true);
    execute.mockResolvedValueOnce({ content: 'ok' });
    await controller.sendMessage(buildReq({ content: 'x'.repeat(100_000) }), res);
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(execute).toHaveBeenCalled();
  });

  it('returns 400 when content exceeds 100 000 chars even for premium users', async () => {
    const { controller, res } = buildMocks(42, true, false);
    await controller.sendMessage(buildReq({ content: 'x'.repeat(100_001) }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sends error SSE event with rate_limit type on ChatRateLimitError', async () => {
    const { execute, controller, res } = buildMocks();
    const resetDate = '2026-06-01T00:00:00.000Z';
    execute.mockRejectedValueOnce(new ChatRateLimitError(resetDate));
    await controller.sendMessage(buildReq({ content: 'Hello' }), res);
    const events = writtenEvents(res);
    expect(events).toContainEqual({ event: 'error', data: { type: 'rate_limit', resetDate } });
  });

  it('sends done SSE event with content on happy path', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockResolvedValueOnce({ content: 'Nice answer' });
    await controller.sendMessage(buildReq({ content: 'Tell me about mitosis' }), res);
    const events = writtenEvents(res);
    expect(events).toContainEqual({ event: 'done', data: expect.objectContaining({ content: 'Nice answer' }) });
    expect(res.end).toHaveBeenCalled();
  });

  it('includes cards in done SSE event when use case returns them', async () => {
    const { execute, controller, res } = buildMocks();
    const cards = [{ front: 'Q', back: 'A' }];
    execute.mockResolvedValueOnce({ content: 'Here are cards', cards });
    await controller.sendMessage(buildReq({ content: 'Make flashcards' }), res);
    const events = writtenEvents(res);
    expect(events).toContainEqual({ event: 'done', data: expect.objectContaining({ cards }) });
  });

  it('passes conversationId from body through to the use case', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockResolvedValueOnce({ content: 'ok', conversationId: 7 });
    await controller.sendMessage(
      buildReq({ content: 'Hi', conversationId: 7 }),
      res
    );
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7 })
    );
  });

  it('rejects non-positive or non-integer conversationId values by sending null', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockResolvedValueOnce({ content: 'ok', conversationId: 1 });
    await controller.sendMessage(
      buildReq({ content: 'Hi', conversationId: 'abc' }),
      res
    );
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: null })
    );
  });

  it('emits conversationId in done event', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockResolvedValueOnce({ content: 'reply', conversationId: 42 });
    await controller.sendMessage(buildReq({ content: 'Hi' }), res);
    const events = writtenEvents(res);
    expect(events).toContainEqual({
      event: 'done',
      data: expect.objectContaining({ conversationId: 42 }),
    });
  });

  it('sends conversation_not_found error event when use case throws ChatConversationNotFoundError', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockRejectedValueOnce(new ChatConversationNotFoundError());
    await controller.sendMessage(
      buildReq({ content: 'Hi', conversationId: 999 }),
      res
    );
    const events = writtenEvents(res);
    expect(events).toContainEqual({
      event: 'error',
      data: { type: 'conversation_not_found' },
    });
  });
});
