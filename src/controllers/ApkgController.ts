import { Request, Response } from 'express';
import path from 'path';
import StorageHandler from '../lib/storage/StorageHandler';
import DownloadService from '../services/DownloadService';
import ApkgPreviewService from '../services/ApkgPreviewService/ApkgPreviewService';
import sendErrorResponse from '../lib/sendErrorResponse';

const MEDIA_CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  wav: 'audio/wav',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

function guessContentType(name: string): string {
  const ext = path.extname(name).replace(/^\./, '').toLowerCase();
  return MEDIA_CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function clampPageSize(input: unknown): number {
  const raw = typeof input === 'string' ? input : '';
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function clampCursor(input: unknown): number {
  const raw = typeof input === 'string' ? input : '';
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function isApkg(key: string): boolean {
  return /\.apkg$/i.test(key);
}

class ApkgController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly previewService: ApkgPreviewService
  ) {}

  private async loadForKey(req: Request, res: Response) {
    const { key } = req.params;
    if (!key || !isApkg(key)) {
      res.status(400).json({ message: 'Not an .apkg upload.' });
      return null;
    }
    const { owner } = res.locals;
    const storage = new StorageHandler();
    const body = await this.downloadService.getFileBody(owner, key, storage);
    if (!body) {
      res.status(404).json({ message: 'Upload not found.' });
      return null;
    }
    const cacheKey = `${owner}:${key}`;
    return this.previewService.parse(cacheKey, body as Buffer);
  }

  async getMeta(req: Request, res: Response) {
    try {
      const parsed = await this.loadForKey(req, res);
      if (!parsed) return;
      res.json(this.previewService.getMeta(parsed));
    } catch (error) {
      if (this.downloadService.isMissingDownloadError(error)) {
        res.status(404).json({ message: 'Upload is no longer available.' });
        return;
      }
      console.info('APKG preview meta failed');
      console.error(error);
      sendErrorResponse(error, res);
    }
  }

  async getCards(req: Request, res: Response) {
    try {
      const parsed = await this.loadForKey(req, res);
      if (!parsed) return;
      const cursor = clampCursor(req.query.cursor);
      const pageSize = clampPageSize(req.query.page_size);
      const deckId = parseDeckId(req.query.deck_id);
      const mediaBaseUrl = `/api/apkg/${encodeURIComponent(
        req.params.key
      )}/media/`;
      res.json(
        this.previewService.getCardsPage(
          parsed,
          cursor,
          pageSize,
          mediaBaseUrl,
          deckId
        )
      );
    } catch (error) {
      if (this.downloadService.isMissingDownloadError(error)) {
        res.status(404).json({ message: 'Upload is no longer available.' });
        return;
      }
      console.info('APKG preview cards failed');
      console.error(error);
      sendErrorResponse(error, res);
    }
  }

  async getMedia(req: Request, res: Response) {
    try {
      const parsed = await this.loadForKey(req, res);
      if (!parsed) return;
      const { name } = req.params;
      if (!name) {
        res.status(400).json({ message: 'Missing media name.' });
        return;
      }
      const buffer = this.previewService.getMediaEntry(parsed, name);
      if (!buffer) {
        res.status(404).send();
        return;
      }
      res.setHeader('Content-Type', guessContentType(name));
      res.setHeader('Cache-Control', 'private, max-age=300');
      res.send(buffer);
    } catch (error) {
      if (this.downloadService.isMissingDownloadError(error)) {
        res.status(404).send();
        return;
      }
      console.info('APKG preview media failed');
      console.error(error);
      sendErrorResponse(error, res);
    }
  }
}

function parseDeckId(input: unknown): number | null {
  if (typeof input !== 'string' || input.length === 0) return null;
  const parsed = Number.parseInt(input, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default ApkgController;
