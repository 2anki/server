import express from 'express';

import { FeedbackController } from '../controllers/FeedbackController';
import { InterviewSnapshotsRepository } from '../data_layer/InterviewSnapshotsRepository';
import JobRepository from '../data_layer/JobRepository';
import UsersRepository from '../data_layer/UsersRepository';
import { getDatabase } from '../data_layer';
import RequireAuthentication from './middleware/RequireAuthentication';

const FeedbackRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const controller = new FeedbackController(
    new UsersRepository(database),
    new JobRepository(database),
    new InterviewSnapshotsRepository(database)
  );

  /**
   * @swagger
   * /api/feedback/interview:
   *   post:
   *     summary: Submit user feedback
   *     description: Logged-in users submit a feedback snapshot. System prefills plan tier, signup date, and conversion count. Creates an interview_snapshot row visible in the ops Interviews tab.
   *     tags: [Feedback]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [story, mainNeed]
   *             properties:
   *               story:
   *                 type: string
   *                 description: A time the product helped the user (maps to memorable_quote)
   *               mainNeed:
   *                 type: string
   *                 description: The user's main frustration or need (maps to opportunity)
   *               secondItem:
   *                 type: string
   *                 description: Optional additional observation
   *     responses:
   *       201:
   *         description: Feedback recorded
   *       400:
   *         description: Validation error
   *       401:
   *         description: Not authenticated
   */
  router.post('/api/feedback/interview', RequireAuthentication, (req, res) =>
    controller.submitFeedback(req, res)
  );

  return router;
};

export default FeedbackRouter;
