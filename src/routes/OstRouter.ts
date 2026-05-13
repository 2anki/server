import express from 'express';

import { OstController } from '../controllers/OstController';
import { OstRepository } from '../data_layer/OstRepository';
import { InterviewSnapshotsRepository } from '../data_layer/InterviewSnapshotsRepository';
import { getDatabase } from '../data_layer';
import RequireOpsAccess from './middleware/RequireOpsAccess';

const OstRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const controller = new OstController(
    new OstRepository(database),
    new InterviewSnapshotsRepository(database)
  );

  /**
   * @swagger
   * /api/ops/discovery/ost:
   *   get:
   *     summary: Get the latest opportunity solution tree
   *     description: Returns the most recently generated OST version with all nodes. Returns null if no tree has been generated yet.
   *     tags: [Ops]
   *     responses:
   *       200:
   *         description: Latest OST version or null
   *       404:
   *         description: Not the ops owner
   */
  router.get('/api/ops/discovery/ost', RequireOpsAccess, (req, res) =>
    controller.getLatest(req, res)
  );

  /**
   * @swagger
   * /api/ops/discovery/ost/generate:
   *   post:
   *     summary: Generate a new opportunity solution tree via Claude
   *     description: Reads all interview snapshots, sends them to Claude, and persists the resulting tree. Requires at least 5 snapshots. Internal — ops owner only.
   *     tags: [Ops]
   *     responses:
   *       201:
   *         description: Newly generated OST version
   *       422:
   *         description: Not enough snapshots to generate a meaningful tree
   *       404:
   *         description: Not the ops owner
   */
  router.post('/api/ops/discovery/ost/generate', RequireOpsAccess, (req, res) =>
    controller.generate(req, res)
  );

  return router;
};

export default OstRouter;
