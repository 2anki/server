import type express from 'express';

jest.mock('../../../services/observability/instrumentedAxios');

jest.mock('../../../data_layer', () => ({
  getDatabase: jest.fn().mockReturnValue({}),
}));

jest.mock('../../../data_layer/GoogleDriveRepository', () => ({
  GoogleDriveRepository: jest.fn().mockImplementation(() => ({
    saveFiles: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../lib/User/getOwner', () => ({
  getOwner: jest.fn().mockReturnValue(null),
}));

jest.mock('../../../lib/isPaying', () => ({
  isPaying: jest.fn().mockReturnValue(false),
}));

jest.mock('../../../lib/integrations/stripe', () => ({
  getStripe: jest.fn().mockReturnValue({
    customers: { retrieve: jest.fn() },
  }),
  updateStoreSubscription: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../services/SubscriptionService', () => ({
  __esModule: true,
  default: { findActiveStripeSubscriptions: jest.fn() },
}));

jest.mock('../../../services/EmailService/EmailService', () => ({
  getDefaultEmailService: jest.fn().mockReturnValue({}),
}));

jest.mock('../../../data_layer/UsersRepository');
jest.mock('../../../services/UsersService');

import instrumentedAxios from '../../../services/observability/instrumentedAxios';
import { handleGoogleDrive } from './handleGoogleDrive';

const mockedAxios = instrumentedAxios as jest.Mocked<typeof instrumentedAxios>;

function makeReq(
  files: object[],
  googleDriveAuth: string | undefined = 'valid-token'
): express.Request {
  return {
    body: {
      files: JSON.stringify(files),
      googleDriveAuth,
    },
  } as unknown as express.Request;
}

function makeRes(): express.Response & { statusCode: number; sentBody: string } {
  return {
    statusCode: 200,
    sentBody: '',
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(body: string) {
      this.sentBody = body;
      return this;
    },
    locals: {},
  } as unknown as express.Response & { statusCode: number; sentBody: string };
}

const basePdfFile = {
  id: 'pdf-file-id',
  name: 'lecture.pdf',
  mimeType: 'application/pdf',
  iconUrl: '',
  url: '',
  sizeBytes: 1024,
  embedUrl: '',
  description: '',
  driveSuccess: true,
  isShared: false,
  lastEditedUtc: 0,
  serviceId: '',
  type: 'document',
};

const baseDocFile = {
  ...basePdfFile,
  id: 'doc-file-id',
  name: 'lecture notes',
  mimeType: 'application/vnd.google-apps.document',
};

const baseSheetFile = {
  ...basePdfFile,
  id: 'sheet-file-id',
  name: 'vocab list',
  mimeType: 'application/vnd.google-apps.spreadsheet',
};

const baseSlidesFile = {
  ...basePdfFile,
  id: 'slides-file-id',
  name: 'bio lecture',
  mimeType: 'application/vnd.google-apps.presentation',
};

describe('handleGoogleDrive — native Google Apps mime types', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: Buffer.from('fake content') } as never);
  });

  it('uses alt=media download URL for binary files (PDF)', async () => {
    const req = makeReq([basePdfFile]);
    const res = makeRes();
    const handleUpload = jest.fn();
    await handleGoogleDrive(req, res, handleUpload);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'google_drive',
      expect.stringContaining('?alt=media'),
      expect.anything()
    );
    expect(handleUpload).toHaveBeenCalled();
    const reqFiles = (req as unknown as { files: { originalname: string }[] }).files;
    expect(reqFiles[0].originalname).toBe('lecture.pdf');
  });

  it('uses export URL for Google Docs and sets .html extension', async () => {
    const req = makeReq([baseDocFile]);
    const res = makeRes();
    const handleUpload = jest.fn();
    await handleGoogleDrive(req, res, handleUpload);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'google_drive',
      expect.stringContaining('/export?mimeType=text%2Fhtml'),
      expect.anything()
    );
    const reqFiles = (req as unknown as { files: { originalname: string }[] }).files;
    expect(reqFiles[0].originalname).toMatch(/\.html$/);
  });

  it('uses export URL for Google Sheets and sets .csv extension', async () => {
    const req = makeReq([baseSheetFile]);
    const res = makeRes();
    const handleUpload = jest.fn();
    await handleGoogleDrive(req, res, handleUpload);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'google_drive',
      expect.stringContaining('/export?mimeType=text%2Fcsv'),
      expect.anything()
    );
    const reqFiles = (req as unknown as { files: { originalname: string }[] }).files;
    expect(reqFiles[0].originalname).toMatch(/\.csv$/);
  });

  it('uses export URL for Google Slides and sets .pdf extension', async () => {
    const req = makeReq([baseSlidesFile]);
    const res = makeRes();
    const handleUpload = jest.fn();
    await handleGoogleDrive(req, res, handleUpload);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'google_drive',
      expect.stringContaining('/export?mimeType=application%2Fpdf'),
      expect.anything()
    );
    const reqFiles = (req as unknown as { files: { originalname: string }[] }).files;
    expect(reqFiles[0].originalname).toMatch(/\.pdf$/);
  });

  it('returns 400 and does not call handleUpload when googleDriveAuth is missing', async () => {
    const req = makeReq([basePdfFile], undefined);
    (req.body as Record<string, unknown>).googleDriveAuth = undefined;
    const res = makeRes();
    const handleUpload = jest.fn();
    await handleGoogleDrive(req, res, handleUpload);
    expect(res.statusCode).toBe(400);
    expect(handleUpload).not.toHaveBeenCalled();
  });
});
