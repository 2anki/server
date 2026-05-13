import express from 'express';

import { OpsDiscoveryController } from '../controllers/OpsDiscoveryController';
import { InterviewSnapshotsRepository } from '../data_layer/InterviewSnapshotsRepository';
import { getDatabase } from '../data_layer';
import RequireOpsAccess from './middleware/RequireOpsAccess';

const OpsDiscoveryRouter = () => {
  const router = express.Router();
  const controller = new OpsDiscoveryController(
    new InterviewSnapshotsRepository(getDatabase())
  );

  /**
   * @swagger
   * /api/ops/discovery/snapshots:
   *   get:
   *     summary: List all interview snapshots
   *     description: Returns all customer interview snapshots with their opportunities. Internal — ops owner only.
   *     tags: [Ops]
   *     responses:
   *       200:
   *         description: Array of snapshots
   *       404:
   *         description: Not the ops owner
   */
  router.get('/api/ops/discovery/snapshots', RequireOpsAccess, (req, res) =>
    controller.listSnapshots(req, res)
  );

  /**
   * @swagger
   * /api/ops/discovery/snapshots:
   *   post:
   *     summary: Create a new interview snapshot
   *     description: Persists one interview snapshot with its opportunities. Internal — ops owner only.
   *     tags: [Ops]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [participantName, interviewDate]
   *             properties:
   *               participantName:
   *                 type: string
   *               interviewDate:
   *                 type: string
   *                 format: date
   *               memorableQuote:
   *                 type: string
   *               planTier:
   *                 type: string
   *               opportunities:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     body:
   *                       type: string
   *                     tag:
   *                       type: string
   *                       enum: [opportunity, insight]
   *     responses:
   *       201:
   *         description: Created snapshot
   *       400:
   *         description: Validation error
   *       404:
   *         description: Not the ops owner
   */
  router.post('/api/ops/discovery/snapshots', RequireOpsAccess, (req, res) =>
    controller.createSnapshot(req, res)
  );

  /**
   * @swagger
   * /api/ops/discovery/snapshots/{id}:
   *   delete:
   *     summary: Delete an interview snapshot
   *     description: Removes a snapshot and its opportunities. Internal — ops owner only.
   *     tags: [Ops]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Deleted
   *       404:
   *         description: Not found or not the ops owner
   */
  router.delete(
    '/api/ops/discovery/snapshots/:id',
    RequireOpsAccess,
    (req, res) => controller.deleteSnapshot(req, res)
  );

  return router;
};

export default OpsDiscoveryRouter;
