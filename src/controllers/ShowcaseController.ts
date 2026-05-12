import { Request, Response } from 'express';

import { IShowcaseRepository } from '../data_layer/ShowcaseRepository';

class ShowcaseController {
  constructor(private readonly repo: IShowcaseRepository) {}

  async getShowcase(_req: Request, res: Response) {
    try {
      const data = await this.repo.get();
      if (data == null) {
        res.status(404).json({ message: 'No showcase data available.' });
        return;
      }
      res.json({
        pageTitle: data.pageTitle,
        notionBlocks: data.notionBlocks,
        ankiCards: data.ankiCards,
        populatedAt: data.populatedAt.toISOString(),
      });
    } catch (error) {
      console.error('[showcase] getShowcase failed', error);
      res.status(500).json({ message: 'Failed to load showcase.' });
    }
  }
}

export default ShowcaseController;
