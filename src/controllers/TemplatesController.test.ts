import { Request, Response } from 'express';

import TemplatesController from './TemplatesController';

jest.mock('../lib/templates/exportNoteTypeToApkg', () => ({
  exportNoteTypeToApkg: jest.fn(),
}));

import { exportNoteTypeToApkg } from '../lib/templates/exportNoteTypeToApkg';

const mockedExport = exportNoteTypeToApkg as jest.MockedFunction<
  typeof exportNoteTypeToApkg
>;

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

function buildService(overrides: Partial<{
  create: jest.Mock;
  delete: jest.Mock;
  findByOwner: jest.Mock;
}> = {}) {
  return {
    create: overrides.create ?? jest.fn().mockResolvedValue(undefined),
    delete: overrides.delete ?? jest.fn().mockResolvedValue(undefined),
    findByOwner: overrides.findByOwner ?? jest.fn().mockResolvedValue(null),
  };
}

const validNoteType = {
  id: 1000,
  name: 'Clean Basic',
  type: 0,
  tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  flds: [
    { name: 'Front', ord: 0 },
    { name: 'Back', ord: 1 },
  ],
  css: '.card { color: black; }',
};

describe('TemplatesController.getUserData', () => {
  it('returns empty payload when user has no saved templates', async () => {
    const service = buildService({ findByOwner: jest.fn().mockResolvedValue(null) });
    const controller = new TemplatesController(service as never);
    const res = buildRes();

    await controller.getUserData(buildReq({}), res);

    expect(res.json).toHaveBeenCalledWith({ templates: [], hiddenIds: [] });
  });

  it('returns persisted payload from the service', async () => {
    const payload = {
      templates: [{ id: 'a' }],
      hiddenIds: ['cloze-modern'],
    };
    const service = buildService({
      findByOwner: jest.fn().mockResolvedValue(payload),
    });
    const controller = new TemplatesController(service as never);
    const res = buildRes();

    await controller.getUserData(buildReq({}), res);

    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('returns 500 when the service throws', async () => {
    const service = buildService({
      findByOwner: jest.fn().mockRejectedValue(new Error('db down')),
    });
    const controller = new TemplatesController(service as never);
    const res = buildRes();

    await controller.getUserData(buildReq({}), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('TemplatesController.saveUserData', () => {
  it('persists templates and hiddenIds arrays', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const controller = new TemplatesController(
      buildService({ create }) as never
    );
    const res = buildRes();

    await controller.saveUserData(
      buildReq({ templates: [{ id: 'x' }], hiddenIds: ['cloze-modern'] }),
      res
    );

    expect(create).toHaveBeenCalledWith(42, {
      templates: [{ id: 'x' }],
      hiddenIds: ['cloze-modern'],
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('coerces missing arrays to empty arrays', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const controller = new TemplatesController(
      buildService({ create }) as never
    );
    const res = buildRes();

    await controller.saveUserData(buildReq({}), res);

    expect(create).toHaveBeenCalledWith(42, { templates: [], hiddenIds: [] });
  });

  it('returns 400 when the service throws', async () => {
    const create = jest.fn().mockRejectedValue(new Error('boom'));
    const controller = new TemplatesController(
      buildService({ create }) as never
    );
    const res = buildRes();

    await controller.saveUserData(buildReq({ templates: [], hiddenIds: [] }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('TemplatesController.listDefaultTemplates', () => {
  it('returns the curated default note types', () => {
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    controller.listDefaultTemplates(buildReq({}), res);

    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
    expect(payload[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      noteType: expect.any(Object),
      previewData: expect.any(Object),
    });
  });
});

describe('TemplatesController.exportTemplate', () => {
  beforeEach(() => {
    mockedExport.mockReset();
  });

  it('returns 400 when noteType is missing', async () => {
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(buildReq({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedExport).not.toHaveBeenCalled();
  });

  it('returns 400 when noteType has empty templates', async () => {
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(
      buildReq({ noteType: { ...validNoteType, tmpls: [] } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when noteType has no fields', async () => {
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(
      buildReq({ noteType: { ...validNoteType, flds: [] } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sets attachment headers and streams the apkg buffer', async () => {
    mockedExport.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(
      buildReq({ noteType: validNoteType, previewData: { Front: 'Q', Back: 'A' } }),
      res
    );

    expect(mockedExport).toHaveBeenCalledWith(validNoteType, { Front: 'Q', Back: 'A' });
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('Clean Basic.apkg')
    );
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('falls back to an empty preview when previewData is absent', async () => {
    mockedExport.mockResolvedValue(Buffer.from([0x50, 0x4b]));
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(buildReq({ noteType: validNoteType }), res);

    expect(mockedExport).toHaveBeenCalledWith(validNoteType, {});
  });

  it('sanitises non-ASCII filenames into a safe attachment name', async () => {
    mockedExport.mockResolvedValue(Buffer.from([0]));
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(
      buildReq({ noteType: { ...validNoteType, name: '日本語/note' } }),
      res
    );

    const dispositionCalls = (res.setHeader as jest.Mock).mock.calls.filter(
      ([k]) => k === 'Content-Disposition'
    );
    expect(dispositionCalls).toHaveLength(1);
    const value = dispositionCalls[0][1];
    expect(value).toMatch(/filename="[^"]+\.apkg"/);
    expect(value).toMatch(/filename\*=UTF-8''/);
  });

  it('returns 500 when the apkg builder throws', async () => {
    mockedExport.mockRejectedValue(new Error('wasm not found'));
    const controller = new TemplatesController(buildService() as never);
    const res = buildRes();

    await controller.exportTemplate(buildReq({ noteType: validNoteType }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
