import DownloadController from './DownloadController';
import { Request, Response } from 'express';

function mockResponse(): Response {
  const headers: Record<string, string> = {};
  const res = {
    locals: { owner: 'test-owner' },
    setHeader: jest.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
    redirect: jest.fn(),
    _headers: headers,
  } as unknown as Response;
  return res;
}

function makeService(overrides: Record<string, unknown> = {}) {
  return {
    isValidKey: () => true,
    getFileBody: jest.fn().mockResolvedValue(Buffer.from('fake-apkg')),
    getFilename: jest.fn().mockResolvedValue(null),
    isMissingDownloadError: () => false,
    deleteMissingFile: jest.fn(),
    ...overrides,
  };
}

describe('DownloadController.getFile', () => {
  it('sets Content-Type and Content-Disposition headers for .apkg files', async () => {
    const controller = new DownloadController(makeService() as any);
    const req = { params: { key: '123-deck.apkg' } } as unknown as Request;
    const res = mockResponse();

    await controller.getFile(req, res, {} as any);

    expect(res.send).toHaveBeenCalledWith(Buffer.from('fake-apkg'));
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"123-deck.apkg\"; filename*=UTF-8''123-deck.apkg"
    );
  });

  it('appends .apkg extension when key lacks it', async () => {
    const controller = new DownloadController(makeService() as any);
    const req = { params: { key: '123-deck' } } as unknown as Request;
    const res = mockResponse();

    await controller.getFile(req, res, {} as any);

    expect(res.send).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"123-deck.apkg\"; filename*=UTF-8''123-deck.apkg"
    );
  });

  it('uses the friendly deck name from DB when available', async () => {
    const controller = new DownloadController(
      makeService({ getFilename: jest.fn().mockResolvedValue('My Custom Deck') }) as any
    );
    const req = { params: { key: 'owner-1234-uuid.apkg' } } as unknown as Request;
    const res = mockResponse();

    await controller.getFile(req, res, {} as any);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"My Custom Deck.apkg\"; filename*=UTF-8''My%20Custom%20Deck.apkg"
    );
  });

  it('falls back to the page-title slug when no custom name and no DB name', async () => {
    const controller = new DownloadController(makeService() as any);
    const req = { params: { key: 'owner-1234-uuid.apkg' } } as unknown as Request;
    const res = mockResponse();

    await controller.getFile(req, res, {} as any);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"owner-1234-uuid.apkg\"; filename*=UTF-8''owner-1234-uuid.apkg"
    );
  });
});
