import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { IoDraftRepository, IoDraftImage } from '../data_layer/IoDraftRepository';
import StorageHandler from '../lib/storage/StorageHandler';

function userId(res: express.Response): number {
  return Number(res.locals['owner']);
}

export class IoDraftController {
  constructor(
    private readonly repo: IoDraftRepository,
    private readonly storage: StorageHandler
  ) {}

  async uploadImage(req: express.Request, res: express.Response): Promise<void> {
    const file = req.file;
    if (file == null) {
      res.status(400).json({ message: 'No image file provided.' });
      return;
    }
    const uid = userId(res);
    const ext = path.extname(file.originalname) || '.jpg';
    const s3Key = `io-drafts/${uid}/${randomUUID()}${ext}`;
    try {
      const data = fs.readFileSync(file.path);
      await this.storage.uploadFile(s3Key, data);
      const presignedUrl = await this.storage.getPresignedUrl(s3Key);
      res.json({ s3Key, presignedUrl });
    } finally {
      fs.unlink(file.path, () => undefined);
    }
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    const { name = 'Untitled deck', mode = 'hide_all', images = [] } = req.body as {
      name?: string;
      mode?: string;
      images?: IoDraftImage[];
    };
    const id = await this.repo.create(userId(res), name, mode, images);
    res.status(201).json({ id });
  }

  async update(req: express.Request, res: express.Response): Promise<void> {
    const { id } = req.params;
    const { name = 'Untitled deck', mode = 'hide_all', images = [] } = req.body as {
      name?: string;
      mode?: string;
      images?: IoDraftImage[];
    };
    await this.repo.update(id, userId(res), name, mode, images);
    res.json({ ok: true });
  }

  async list(req: express.Request, res: express.Response): Promise<void> {
    const drafts = await this.repo.listByUser(userId(res));
    const result = drafts.map((d) => ({
      id: d.id,
      name: d.name,
      mode: d.mode,
      imageCount: Array.isArray(d.images) ? d.images.length : 0,
      cardCount: Array.isArray(d.images)
        ? (d.images as IoDraftImage[]).reduce(
            (sum, img) => sum + (Array.isArray(img.rects) ? img.rects.length : 0),
            0
          )
        : 0,
      updated_at: d.updated_at,
    }));
    res.json(result);
  }

  async get(req: express.Request, res: express.Response): Promise<void> {
    const draft = await this.repo.getById(req.params['id'], userId(res));
    if (draft == null) {
      res.status(404).json({ message: 'Draft not found.' });
      return;
    }
    const images = await Promise.all(
      (draft.images as IoDraftImage[]).map(async (img) => ({
        ...img,
        presignedUrl: await this.storage.getPresignedUrl(img.s3Key).catch(() => ''),
      }))
    );
    res.json({ ...draft, images });
  }

  async remove(req: express.Request, res: express.Response): Promise<void> {
    const deleted = await this.repo.delete(req.params['id'], userId(res));
    await Promise.all(deleted.map((img) => this.storage.delete(img.s3Key)));
    res.json({ ok: true });
  }
}
