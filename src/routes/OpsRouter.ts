import express from 'express';

import OpsController from '../controllers/OpsController';
import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { ObservabilityRepository } from '../data_layer/ObservabilityRepository';
import { ObservabilityQueryService } from '../services/observability/ObservabilityQueryService';
import { getDatabase } from '../data_layer';
import RequireOpsAccess from './middleware/RequireOpsAccess';

const OpsRouter = () => {
  const router = express.Router();
  const repo = new ObservabilityRepository(getDatabase());
  const queryService = new ObservabilityQueryService(repo);
  const controller = new OpsController(new GetOpsMetricsUseCase(queryService));

  /**
   * @swagger
   * /ops/api/metrics:
   *   get:
   *     summary: Aggregated request/outbound observability metrics
   *     description: Internal endpoint locked to the ops owner. Returns 404 for everyone else (we don't reveal that the dashboard exists).
   *     tags: [Ops]
   *     parameters:
   *       - in: query
   *         name: window
   *         required: false
   *         schema:
   *           type: string
   *           enum: [1h, 24h, 7d]
   *     responses:
   *       200:
   *         description: Metrics payload
   *       404:
   *         description: Not the ops owner
   */
  router.get('/ops/api/metrics', RequireOpsAccess, (req, res) =>
    controller.getMetrics(req, res)
  );

  return router;
};

export default OpsRouter;
