import { Request, Response } from 'express';

import { buildContentDisposition } from '../lib/buildContentDisposition';
import { getOwner } from '../lib/User/getOwner';
import {
  AnkiNoteType,
  exportNoteTypeToApkg,
} from '../lib/templates/exportNoteTypeToApkg';
import { getDefaultTemplates } from '../services/DefaultTemplatesService';
import { getOfficialTemplates } from '../services/officialTemplates';
import {
  AINoteTypeUseCase,
  ChatMessage,
  NoteTypeStarterInput,
} from '../usecases/ai/AINoteTypeUseCase';
import TemplatesService from '../services/TemplatesService';

const EMPTY_USER_PAYLOAD = { templates: [], hiddenIds: [] } as const;

function isValidNoteType(value: unknown): value is AnkiNoteType {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AnkiNoteType>;
  if (typeof candidate.name !== 'string') return false;
  if (!Array.isArray(candidate.tmpls) || candidate.tmpls.length === 0) {
    return false;
  }
  if (!Array.isArray(candidate.flds) || candidate.flds.length === 0) {
    return false;
  }
  return true;
}

function safeApkgFilename(name: string | undefined): string {
  const trimmed = (name ?? '').trim();
  const safe = trimmed.replace(/[^\p{L}\p{N}\-_ ]/gu, '_');
  const base = safe.length === 0 ? 'template' : safe;
  return `${base}.apkg`;
}

class TemplatesController {
  constructor(
    private readonly service: TemplatesService,
    private readonly aiUseCase: AINoteTypeUseCase = new AINoteTypeUseCase()
  ) {}

  async createTemplate(req: Request, res: Response) {
    const { templates } = req.body;
    const owner = getOwner(res);

    try {
      await this.service.create(owner, templates);
      res.status(200).send();
    } catch {
      res.status(400).send();
    }
  }

  async deleteTemplate(_req: Request, res: Response) {
    const owner = getOwner(res);

    try {
      await this.service.delete(owner);
      res.status(200).send();
    } catch {
      res.status(400).send();
    }
  }

  async getUserData(_req: Request, res: Response) {
    const owner = getOwner(res);

    try {
      const payload = await this.service.findByOwner(owner);
      res.json(payload ?? EMPTY_USER_PAYLOAD);
    } catch {
      res.status(500).json({ error: 'Failed to load templates' });
    }
  }

  async saveUserData(req: Request, res: Response) {
    const owner = getOwner(res);
    const body = req.body ?? {};
    const templates = Array.isArray(body.templates) ? body.templates : [];
    const hiddenIds = Array.isArray(body.hiddenIds) ? body.hiddenIds : [];

    try {
      await this.service.create(owner, { templates, hiddenIds });
      res.status(200).json({ ok: true });
    } catch {
      res.status(400).json({ error: 'Failed to save templates' });
    }
  }

  listDefaultTemplates(_req: Request, res: Response) {
    res.json(getDefaultTemplates());
  }

  listOfficialTemplates(_req: Request, res: Response) {
    res.json(getOfficialTemplates());
  }

  async aiGenerate(req: Request, res: Response) {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    if (prompt.trim().length === 0) {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }
    try {
      const result = await this.aiUseCase.generate(prompt);
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI generation failed';
      res.status(500).json({ error: message });
    }
  }

  async aiModify(req: Request, res: Response) {
    const body = req.body ?? {};
    const instruction =
      typeof body.instruction === 'string' ? body.instruction : '';
    if (instruction.trim().length === 0) {
      res.status(400).json({ error: 'instruction is required' });
      return;
    }
    const starter = body.starter as NoteTypeStarterInput | undefined;
    if (!starter || typeof starter !== 'object') {
      res.status(400).json({ error: 'starter is required' });
      return;
    }
    const history: ChatMessage[] = Array.isArray(body.history)
      ? (body.history as ChatMessage[])
      : [];
    try {
      const result = await this.aiUseCase.modify(starter, instruction, history);
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI modify failed';
      res.status(500).json({ error: message });
    }
  }

  async exportTemplate(req: Request, res: Response) {
    const { noteType, previewData } = req.body ?? {};

    if (!isValidNoteType(noteType)) {
      res.status(400).json({ error: 'Invalid note type' });
      return;
    }

    const safePreview =
      previewData && typeof previewData === 'object' ? previewData : {};

    try {
      const buffer = await exportNoteTypeToApkg(noteType, safePreview);
      const filename = safeApkgFilename(noteType.name);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', buildContentDisposition(filename));
      res.send(buffer);
    } catch {
      res.status(500).json({ error: 'Failed to generate APKG' });
    }
  }
}

export default TemplatesController;
