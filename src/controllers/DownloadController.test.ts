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

describe('DownloadController.getFile', () => {
  it('sets Content-Type and Content-Disposition headers for .apkg files', async () => {
    const service = {
      isValidKey: () => true,
      getFileBody: jest.fn().mockResolvedValue(Buffer.from('fake-apkg')),
      isMissingDownloadError: () => false,
      deleteMissingFile: jest.fn(),
    };

    const controller = new DownloadController(service as any);
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
    const service = {
      isValidKey: () => true,
      getFileBody: jest.fn().mockResolvedValue(Buffer.from('data')),
      isMissingDownloadError: () => false,
      deleteMissingFile: jest.fn(),
    };

    const controller = new DownloadController(service as any);
    const req = { params: { key: '123-deck' } } as unknown as Request;
    const res = mockResponse();

    await controller.getFile(req, res, {} as any);

    expect(res.send).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      "attachment; filename=\"123-deck.apkg\"; filename*=UTF-8''123-deck.apkg"
    );
  });
});
