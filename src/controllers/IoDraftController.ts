import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import express from "express";
import { IoDraftRepository, IoDraftImage } from "../data_layer/IoDraftRepository";
import StorageHandler from "../lib/storage/StorageHandler";

function userId(res: express.Response): number { return Number(res.locals["owner"]); }

export class IoDraftController {
  constructor(private readonly repo: IoDraftRepository, private readonly storage: StorageHandler) {}

  async uploadImage(req: express.Request, res: express.Response): Promise<void> {
    const file = req.file;
    if (file == null) { res.status(400).json({ message: "No image file provided." }); return; }
    const ext = path.extname(file.originalname) || ".jpg";
    const s3Key = `io-drafts/${userId(res)}/${randomUUID()}${ext}`;
    try {
      await this.storage.uploadFile(s3Key, fs.readFileSync(file.path));
      res.json({ s3Key, presignedUrl: await this.storage.getPresignedUrl(s3Key) });
    } finally { fs.unlink(file.path, () => undefined); }
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    const { name = "Untitled deck", mode = "hide_all", images = [] } = req.body as { name?: string; mode?: string; images?: IoDraftImage[] };
    res.status(201).json({ id: await this.repo.create(userId(res), name, mode, images) });
  }

  async update(req: express.Request, res: express.Response): Promise<void> {
    const { name = "Untitled deck", mode = "hide_all", images = [] } = req.body as { name?: string; mode?: string; images?: IoDraftImage[] };
    await this.repo.update(req.params["id"], userId(res), name, mode, images);
    res.json({ ok: true });
  }

  async list(_req: express.Request, res: express.Response): Promise<void> {
    const drafts = await this.repo.listByUser(userId(res));
    res.json(drafts.map((d) => ({
      id: d.id, name: d.name, mode: d.mode, updated_at: d.updated_at,
      imageCount: Array.isArray(d.images) ? d.images.length : 0,
      cardCount: Array.isArray(d.images) ? (d.images as IoDraftImage[]).reduce((s, img) => s + (Array.isArray(img.rects) ? img.rects.length : 0), 0) : 0,
    })));
  }

  async get(req: express.Request, res: express.Response): Promise<void> {
    const draft = await this.repo.getById(req.params["id"], userId(res));
    if (draft == null) { res.status(404).json({ message: "Draft not found." }); return; }
    const images = await Promise.all((draft.images as IoDraftImage[]).map(async (img) => ({
      ...img, presignedUrl: await this.storage.getPresignedUrl(img.s3Key).catch(() => ""),
    })));
    res.json({ ...draft, images });
  }

  async remove(req: express.Request, res: express.Response): Promise<void> {
    const deleted = await this.repo.deleteById(req.params["id"], userId(res));
    await Promise.all(deleted.map((img) => this.storage.delete(img.s3Key)));
    res.json({ ok: true });
  }
}
