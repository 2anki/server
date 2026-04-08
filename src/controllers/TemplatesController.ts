import { Request, Response } from 'express';

import { getOwner } from '../lib/User/getOwner';
import { TemplateService } from '../services/TemplatesService/TemplateService';
import { exportNoteTypeToApkg } from '../lib/templates/exportNoteTypeToApkg';

class TemplatesController {
  constructor(private readonly service: TemplateService) {}

  async getUserData(req: Request, res: Response) {
    const owner = getOwner(res);
    try {
      const data = await this.service.findByOwner(owner);
      res.json(data || { templates: [], hiddenIds: [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load templates' });
    }
  }

  async saveUserData(req: Request, res: Response) {
    const owner = getOwner(res);
    const { templates, hiddenIds } = req.body;
    try {
      await this.service.create(owner, { templates: templates || [], hiddenIds: hiddenIds || [] });
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to save templates' });
    }
  }

  async createTemplate(req: Request, res: Response) {
    const { templates } = req.body;
    const owner = getOwner(res);

    try {
      await this.service.create(owner, templates);
      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    const owner = getOwner(res);

    try {
      await this.service.delete(owner);
      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  }

  async exportTemplate(req: Request, res: Response) {
    const { noteType, previewData } = req.body;

    if (!noteType || !noteType.tmpls || !noteType.tmpls[0]) {
      res.status(400).json({ error: 'Invalid note type' });
      return;
    }

    try {
      const apkgBuffer = await exportNoteTypeToApkg(noteType, previewData ?? {});
      const filename = `${(noteType.name || 'template').replace(/[^a-zA-Z0-9-_]/g, '_')}.apkg`;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(apkgBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate APKG' });
    }
  }
}

export default TemplatesController;
