import express from 'express';

import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';

class OpsController {
  constructor(private readonly getOpsMetrics: GetOpsMetricsUseCase) {}

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
}

export default OpsController;
