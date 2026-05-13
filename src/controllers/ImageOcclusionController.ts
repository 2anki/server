import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

import {
  CreateImageOcclusionDeckUseCase,
  ImageOcclusionImage,
  OcclusionRect,
} from '../usecases/imageOcclusion/CreateImageOcclusionDeckUseCase';

interface RawRect {
  x: unknown;
  y: unknown;
  w: unknown;
  h: unknown;
  imgW: unknown;
  imgH: unknown;
  label?: unknown;
}

interface RawImageEntry {
  imageName?: unknown;
  header?: unknown;
  rects?: unknown;
}

interface RawData {
  deckName?: unknown;
  mode?: unknown;
  images?: unknown;
}

function parseRect(r: RawRect): OcclusionRect {
  return {
    x: Number(r.x),
    y: Number(r.y),
    w: Number(r.w),
    h: Number(r.h),
    imgW: Number(r.imgW),
    imgH: Number(r.imgH),
    label: typeof r.label === 'string' ? r.label : '',
  };
}

function parseImageEntry(entry: RawImageEntry): ImageOcclusionImage {
  return {
    imageName: typeof entry.imageName === 'string' ? entry.imageName : '',
    header: typeof entry.header === 'string' ? entry.header : '',
    rects: Array.isArray(entry.rects)
      ? (entry.rects as RawRect[]).map(parseRect)
      : [],
  };
}

class ImageOcclusionController {
  private readonly useCase: CreateImageOcclusionDeckUseCase;

  constructor(useCase: CreateImageOcclusionDeckUseCase) {
    this.useCase = useCase;
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    let rawData: RawData;
    try {
      rawData = JSON.parse(
        typeof req.body?.data === 'string' ? req.body.data : '{}'
      ) as RawData;
    } catch {
      res.status(400).json({ message: 'Invalid JSON in data field.' });
      return;
    }

    const deckName =
      typeof rawData.deckName === 'string' && rawData.deckName.trim()
        ? rawData.deckName.trim()
        : 'Image Occlusion';

    const mode =
      rawData.mode === 'hide_one' ? 'hide_one' : 'hide_all';

    const images: ImageOcclusionImage[] = Array.isArray(rawData.images)
      ? (rawData.images as RawImageEntry[]).map(parseImageEntry)
      : [];

    if (images.length === 0) {
      res.status(400).json({ message: 'At least one image is required.' });
      return;
    }

    const uploadedFiles = (
      req.files as Express.Multer.File[] | undefined ?? []
    );

    const imageFiles = uploadedFiles.map((f) => ({
      name: f.originalname,
      path: f.path,
    }));

    const isPaying =
      res.locals['patreon'] === true || res.locals['subscriber'] === true;

    let apkgPath: string;
    try {
      apkgPath = await this.useCase.execute({
        deckName,
        mode,
        images,
        imageFiles,
        isPaying,
      });
    } catch (err) {
      const statusErr = err as NodeJS.ErrnoException & { status?: number };
      if (statusErr.status === 403) {
        res.status(403).json({ message: statusErr.message });
        return;
      }
      throw err;
    } finally {
      for (const f of uploadedFiles) {
        fs.unlink(f.path, () => undefined);
      }
    }

    const filename = path.basename(apkgPath);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.setHeader('Content-Type', 'application/octet-stream');

    const stream = fs.createReadStream(apkgPath);
    stream.on('end', () => {
      fs.unlink(apkgPath, () => undefined);
    });
    stream.pipe(res);
  }
}

export default ImageOcclusionController;
