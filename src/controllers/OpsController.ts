import express from 'express';

import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { GetBusinessMetricsUseCase } from '../usecases/ops/GetBusinessMetricsUseCase';

class OpsController {
  constructor(
    private readonly getOpsMetrics: GetOpsMetricsUseCase,
    private readonly getBusinessMetricsUseCase?: GetBusinessMetricsUseCase
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
}

export default OpsController;
