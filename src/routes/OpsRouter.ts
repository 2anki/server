import express from 'express';

import OpsController from '../controllers/OpsController';
import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { GetBusinessMetricsUseCase } from '../usecases/ops/GetBusinessMetricsUseCase';
import { GetConversionMetricsUseCase } from '../usecases/ops/GetConversionMetricsUseCase';
import { PopulateShowcaseUseCase } from '../usecases/ops/PopulateShowcaseUseCase';
import { ObservabilityRepository } from '../data_layer/ObservabilityRepository';
import { ObservabilityQueryService } from '../services/observability/ObservabilityQueryService';
import { BusinessMetricsService } from '../services/ops/BusinessMetricsService';
import { ConversionMetricsService } from '../services/ops/ConversionMetricsService';
import { BusinessMetricsCacheRepository } from '../data_layer/BusinessMetricsCacheRepository';
import { CancellationFeedbackRepository } from '../data_layer/CancellationFeedbackRepository';
import { ShowcaseRepository } from '../data_layer/ShowcaseRepository';
import DownloadRepository from '../data_layer/DownloadRepository';
import NotionRepository from '../data_layer/NotionRespository';
import DownloadService from '../services/DownloadService';
import ApkgPreviewService from '../services/ApkgPreviewService/ApkgPreviewService';
import { NotionService } from '../services/NotionService/NotionService';
import { getDatabase } from '../data_layer';
import RequireOpsAccess from './middleware/RequireOpsAccess';

const OpsRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new ObservabilityRepository(database);
  const queryService = new ObservabilityQueryService(repo);

  const businessMetricsService = new BusinessMetricsService({
    cacheRepository: new BusinessMetricsCacheRepository(database),
    cancellationRepository: new CancellationFeedbackRepository(database),
  });

  const conversionMetricsService = new ConversionMetricsService(database);

  const showcaseRepo = new ShowcaseRepository(database);
  const populateShowcase = new PopulateShowcaseUseCase(
    showcaseRepo,
    new NotionService(new NotionRepository(database)),
    new ApkgPreviewService(),
    new DownloadService(new DownloadRepository(database))
  );

  const controller = new OpsController(
    new GetOpsMetricsUseCase(queryService),
    new GetBusinessMetricsUseCase(businessMetricsService),
    new GetConversionMetricsUseCase(conversionMetricsService),
    populateShowcase,
    showcaseRepo
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

  /**
   * @swagger
   * /api/ops/conversion/metrics:
   *   get:
   *     summary: Conversion success/failure metrics from jobs table
   *     description: Internal endpoint locked to the ops owner. Returns 404 for everyone else.
   *     tags: [Ops]
   *     responses:
   *       200:
   *         description: Conversion metrics payload
   *       404:
   *         description: Not the ops owner
   */
  router.get('/api/ops/conversion/metrics', RequireOpsAccess, (req, res) =>
    controller.getConversionMetrics(req, res)
  );

  router.post('/api/ops/showcase/populate', RequireOpsAccess, (req, res) =>
    controller.populateShowcase(req, res)
  );

  router.delete('/api/ops/showcase', RequireOpsAccess, (req, res) =>
    controller.purgeShowcase(req, res)
  );

  return router;
};

export default OpsRouter;
