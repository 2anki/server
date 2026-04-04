import { Request, Response } from 'express';

import { getOwner } from '../lib/User/getOwner';
import PublicTemplatesRepository from '../data_layer/PublicTemplatesRepository';

class PublicTemplatesController {
  constructor(private readonly repository: PublicTemplatesRepository) {}

  async list(_req: Request, res: Response) {
    try {
      const rows = await this.repository.findAll();
      const templates = rows.map((row) => ({
        id: String(row.id),
        ownerName: row.owner_name,
        name: row.name,
        description: row.description ?? '',
        noteType: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
        previewData: row.preview_data
          ? typeof row.preview_data === 'string'
            ? JSON.parse(row.preview_data)
            : row.preview_data
          : {},
        tags: row.tags
          ? typeof row.tags === 'string'
            ? JSON.parse(row.tags)
            : row.tags
          : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isShared: true,
      }));
      res.json(templates);
    } catch (error) {
      console.error('Failed to list public templates:', error);
      res.status(500).json({ error: 'Failed to list public templates' });
    }
  }

  async publish(req: Request, res: Response) {
    const owner = getOwner(res);
    const { name, description, noteType, previewData, tags } = req.body;

    if (!name || !noteType) {
      res.status(400).json({ error: 'name and noteType are required' });
      return;
    }

    try {
      await this.repository.create({
        owner,
        name,
        description,
        payload: noteType,
        previewData,
        tags,
      });
      res.status(201).json({ message: 'Template published successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to publish template' });
    }
  }
}

export default PublicTemplatesController;
