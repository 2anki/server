import fs from 'fs';
import os from 'os';
import path from 'path';

import { Request, Response } from 'express';

import { getOwner } from '../lib/User/getOwner';
import { TemplateService } from '../services/TemplatesService/TemplateService';
import CustomExporter from '../lib/parser/exporters/CustomExporter';

class TemplatesController {
  constructor(private readonly service: TemplateService) {}

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
    const { noteType } = req.body;

    if (!noteType || !noteType.tmpls || !noteType.tmpls[0]) {
      res.status(400).json({ error: 'Invalid note type' });
      return;
    }

    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'template-export-'));

    try {
      const cardType = noteType.tmpls[0];
      const isCloze = noteType.type === 1;
      const templateKey = isCloze ? 'n2aCloze' : 'n2aBasic';

      const sampleCard = {
        name: noteType.flds.map((f: { name: string }) => `[${f.name}]`).join(' ') || 'Sample',
        back: '',
        tags: [],
        cloze: isCloze,
        number: 1,
        enableInput: false,
        answer: '',
        media: [],
      };

      const deckInfo = [
        {
          name: noteType.name || 'Exported Template',
          style: '',
          settings: {
            template: 'custom',
            [templateKey]: {
              front: cardType.qfmt,
              back: cardType.afmt,
              styling: noteType.css || '',
            },
          },
          cards: [sampleCard],
        },
      ];

      const exporter = new CustomExporter(noteType.name || 'template', workspace);
      exporter.configure(deckInfo as never[]);
      const apkgBuffer = await exporter.save();

      const filename = `${(noteType.name || 'template').replace(/[^a-zA-Z0-9-_]/g, '_')}.apkg`;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(apkgBuffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate APKG' });
    } finally {
      fs.rmSync(workspace, { recursive: true, force: true });
    }
  }
}

export default TemplatesController;
