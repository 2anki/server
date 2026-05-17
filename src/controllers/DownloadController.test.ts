import DownloadController from './DownloadController';
import { Request, Response } from 'express';
import { Writable } from 'stream';
import path from 'path';
import os from 'os';
import fs from 'fs';

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

describe('DownloadController.getBulkDownload', () => {
  let workspaceBase: string;
  let originalWorkspaceBase: string | undefined;

  beforeEach(() => {
    workspaceBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bulk-test-'));
    originalWorkspaceBase = process.env.WORKSPACE_BASE;
    process.env.WORKSPACE_BASE = workspaceBase;
  });

  afterEach(() => {
    fs.rmSync(workspaceBase, { recursive: true, force: true });
    if (originalWorkspaceBase === undefined) {
      delete process.env.WORKSPACE_BASE;
    } else {
      process.env.WORKSPACE_BASE = originalWorkspaceBase;
    }
  });

  function streamingResponse(): { res: Response; chunks: Buffer[]; done: Promise<void> } {
    const chunks: Buffer[] = [];
    let resolveDone!: () => void;
    const done = new Promise<void>((resolve) => {
      resolveDone = resolve;
    });

    const sink = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        cb();
      },
    });
    sink.on('finish', () => resolveDone());

    const res = Object.assign(sink, {
      headersSent: false,
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }) as unknown as Response;

    return { res, chunks, done };
  }

  it('streams a zip archive of the .apkg files in the workspace', async () => {
    const id = 'workspace-with-decks';
    const workspace = path.join(workspaceBase, id);
    fs.mkdirSync(workspace);
    fs.writeFileSync(path.join(workspace, 'deck-one.apkg'), 'fake-apkg-one');
    fs.writeFileSync(path.join(workspace, 'deck-two.apkg'), 'fake-apkg-two');

    const controller = new DownloadController(makeService() as any);
    const req = { params: { id } } as unknown as Request;
    const { res, chunks, done } = streamingResponse();

    controller.getBulkDownload(req, res);
    await done;

    expect((res.status as jest.Mock)).not.toHaveBeenCalledWith(500);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
    expect(chunks.length).toBeGreaterThan(0);
    expect(Buffer.concat(chunks).subarray(0, 2).toString()).toBe('PK');
  });
});
