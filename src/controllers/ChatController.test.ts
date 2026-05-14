import { Request, Response } from 'express';
import ChatController from './ChatController';
import { ChatRateLimitError } from '../usecases/chat/ChatUseCase';

function buildMocks(owner = 42, patreon = false) {
  const execute = jest.fn();
  const controller = new ChatController({ execute } as never);
  const res = buildRes(owner, patreon);
  return { execute, controller, res };
}

function buildRes(owner = 42, patreon = false): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    locals: { owner, patreon },
  } as unknown as Response;
}

function buildReq(body: unknown): Request {
  return { body } as unknown as Request;
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

  it('returns 400 when content exceeds 4000 chars', async () => {
    const { controller, res } = buildMocks();
    await controller.sendMessage(buildReq({ content: 'x'.repeat(4001) }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 429 when ChatRateLimitError is thrown', async () => {
    const { execute, controller, res } = buildMocks();
    const resetDate = '2026-06-01T00:00:00.000Z';
    execute.mockRejectedValueOnce(new ChatRateLimitError(resetDate));
    await controller.sendMessage(buildReq({ content: 'Hello' }), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Message limit reached', resetDate })
    );
  });

  it('returns assistant message on happy path', async () => {
    const { execute, controller, res } = buildMocks();
    execute.mockResolvedValueOnce({ content: 'Nice answer', cards: undefined });
    await controller.sendMessage(buildReq({ content: 'Tell me about mitosis' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'assistant', content: 'Nice answer' })
    );
  });

  it('includes cards in response when use case returns them', async () => {
    const { execute, controller, res } = buildMocks();
    const cards = [{ front: 'Q', back: 'A' }];
    execute.mockResolvedValueOnce({ content: 'Here are cards', cards });
    await controller.sendMessage(buildReq({ content: 'Make flashcards' }), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ cards })
    );
  });
});
