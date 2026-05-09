import express from 'express';

import OpsController from '../controllers/OpsController';
import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { GetBusinessMetricsUseCase } from '../usecases/ops/GetBusinessMetricsUseCase';
import { ObservabilityRepository } from '../data_layer/ObservabilityRepository';
import { ObservabilityQueryService } from '../services/observability/ObservabilityQueryService';
import { BusinessMetricsService } from '../services/ops/BusinessMetricsService';
import { BusinessMetricsCacheRepository } from '../data_layer/BusinessMetricsCacheRepository';
import { getDatabase } from '../data_layer';
import RequireOpsAccess from './middleware/RequireOpsAccess';

const OpsRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new ObservabilityRepository(database);
  const queryService = new ObservabilityQueryService(repo);

  const businessMetricsService = new BusinessMetricsService({
    cacheRepository: new BusinessMetricsCacheRepository(database),
  });

  const controller = new OpsController(
    new GetOpsMetricsUseCase(queryService),
    new GetBusinessMetricsUseCase(businessMetricsService)
  );

  /**
   * @swagger
   * /api/ops/metrics:
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
  router.get('/api/ops/metrics', RequireOpsAccess, (req, res) =>
    controller.getMetrics(req, res)
  );

  /**
   * @swagger
   * /api/ops/business/metrics:
   *   get:
   *     summary: Business metrics from Stripe-backed subscriptions
   *     description: Internal endpoint locked to the ops owner. Returns 404 for everyone else.
   *     tags: [Ops]
   *     responses:
   *       200:
   *         description: Business metrics payload
   *       404:
   *         description: Not the ops owner
   */
  router.get('/api/ops/business/metrics', RequireOpsAccess, (req, res) =>
    controller.getBusinessMetrics(req, res)
  );

  return router;
};

export default OpsRouter;
