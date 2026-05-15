import { Request, Response } from 'express';
import ChatDeckController from './ChatDeckController';

function buildRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    locals: { owner: 42 },
  } as unknown as Response;
}

function buildReq(body: unknown): Request {
  return { body } as unknown as Request;
}

const validCards = [
  { front: 'Q1', back: 'A1' },
  { front: 'Q2', back: 'A2' },
];

describe('ChatDeckController.generate', () => {
  it('returns 400 when deckName is missing', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: validCards }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when deckName is empty string', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: validCards, deckName: '' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when deckName exceeds 120 chars', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: validCards, deckName: 'x'.repeat(121) }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when cards is not an array', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: 'not-an-array', deckName: 'My Deck' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when cards is empty', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: [], deckName: 'My Deck' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when cards array exceeds 200 items', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();
    const tooManyCards = Array.from({ length: 201 }, (_, i) => ({ front: `Q${i}`, back: `A${i}` }));

    await controller.generate(buildReq({ cards: tooManyCards, deckName: 'My Deck' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when a card is missing front field', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: [{ back: 'A1' }], deckName: 'My Deck' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when a card is missing back field', async () => {
    const useCase = { execute: jest.fn() };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: [{ front: 'Q1' }], deckName: 'My Deck' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls use case and sends buffer on valid input', async () => {
    const fakeBuffer = Buffer.from('fake-apkg-data');
    const useCase = { execute: jest.fn().mockResolvedValue(fakeBuffer) };
    const controller = new ChatDeckController(useCase as never);
    const res = buildRes();

    await controller.generate(buildReq({ cards: validCards, deckName: 'My Deck' }), res);

    expect(useCase.execute).toHaveBeenCalledWith({ cards: validCards, deckName: 'My Deck' });
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"My Deck.apkg\"; filename*=UTF-8''My%20Deck.apkg"
    );
    expect(res.send).toHaveBeenCalledWith(fakeBuffer);
  });
});
