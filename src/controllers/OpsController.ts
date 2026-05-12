import express from 'express';

import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { GetBusinessMetricsUseCase } from '../usecases/ops/GetBusinessMetricsUseCase';
import { GetConversionMetricsUseCase } from '../usecases/ops/GetConversionMetricsUseCase';
import { PopulateShowcaseUseCase } from '../usecases/ops/PopulateShowcaseUseCase';
import { IShowcaseRepository } from '../data_layer/ShowcaseRepository';

class OpsController {
  constructor(
    private readonly getOpsMetrics: GetOpsMetricsUseCase,
    private readonly getBusinessMetricsUseCase?: GetBusinessMetricsUseCase,
    private readonly getConversionMetricsUseCase?: GetConversionMetricsUseCase,
    private readonly populateShowcaseUseCase?: PopulateShowcaseUseCase,
    private readonly showcaseRepo?: IShowcaseRepository
  ) {}

  async getMetrics(req: express.Request, res: express.Response) {
    try {
      const window = req.query.window;
      const result = await this.getOpsMetrics.execute(window);
      res.status(200).json(result);
    } catch (error) {
      console.error('[ops] getMetrics failed', error);
      res.status(500).json({ message: 'Failed to load ops metrics' });
    }
  }

  async getBusinessMetrics(_req: express.Request, res: express.Response) {
    if (this.getBusinessMetricsUseCase == null) {
      res.status(500).json({ message: 'Business metrics not configured' });
      return;
    }
    try {
      const result = await this.getBusinessMetricsUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      console.error('[ops] getBusinessMetrics failed', error);
      res.status(500).json({ message: 'Failed to load business metrics' });
    }
  }

  async getConversionMetrics(_req: express.Request, res: express.Response) {
    if (this.getConversionMetricsUseCase == null) {
      res.status(500).json({ message: 'Conversion metrics not configured' });
      return;
    }
    try {
      const result = await this.getConversionMetricsUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      console.error('[ops] getConversionMetrics failed', error);
      res.status(500).json({ message: 'Failed to load conversion metrics' });
    }
  }
  async populateShowcase(req: express.Request, res: express.Response) {
    if (this.populateShowcaseUseCase == null) {
      res.status(500).json({ message: 'Showcase not configured' });
      return;
    }
    try {
      const { pageId, apkgKey } = req.body;
      if (typeof pageId !== 'string' || pageId.trim().length === 0) {
        res.status(400).json({ message: 'pageId is required' });
        return;
      }
      if (typeof apkgKey !== 'string' || apkgKey.trim().length === 0) {
        res.status(400).json({ message: 'apkgKey is required' });
        return;
      }
      await this.populateShowcaseUseCase.execute(
        res.locals.owner,
        pageId.trim(),
        apkgKey.trim()
      );
      res.status(200).json({ message: 'Showcase populated.' });
    } catch (error) {
      console.error('[ops] populateShowcase failed', error);
      res.status(500).json({ message: 'Failed to populate showcase.' });
    }
  }

  async purgeShowcase(_req: express.Request, res: express.Response) {
    if (this.showcaseRepo == null) {
      res.status(500).json({ message: 'Showcase not configured' });
      return;
    }
    try {
      await this.showcaseRepo.purge();
      res.status(200).json({ message: 'Showcase purged.' });
    } catch (error) {
      console.error('[ops] purgeShowcase failed', error);
      res.status(500).json({ message: 'Failed to purge showcase.' });
    }
  }
}

export default OpsController;
