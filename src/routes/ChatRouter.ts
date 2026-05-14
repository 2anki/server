import express from 'express';
import ChatController from '../controllers/ChatController';
import { ChatUseCase } from '../usecases/chat/ChatUseCase';
import { ChatMessagesRepository } from '../data_layer/ChatMessagesRepository';
import { getDatabase } from '../data_layer';
import { getAnthropicClient } from '../lib/claude/ClaudeService';
import RequireAuthentication from './middleware/RequireAuthentication';

const ChatRouter = () => {
  const router = express.Router();
  const db = getDatabase();
  const repo = new ChatMessagesRepository(db);
  const anthropic = getAnthropicClient();
  const useCase = new ChatUseCase(repo, anthropic);
  const controller = new ChatController(useCase);

  /**
   * @swagger
   * /api/chat/message:
   *   post:
   *     summary: Send a message to the study assistant
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [content]
   *             properties:
   *               content:
   *                 type: string
   *                 maxLength: 4000
   *               history:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required: [role, content]
   *                   properties:
   *                     role:
   *                       type: string
   *                       enum: [user, assistant]
   *                     content:
   *                       type: string
   *     responses:
   *       200:
   *         description: Assistant reply
   *       400:
   *         description: Invalid content
   *       429:
   *         description: Monthly message limit reached
   */
  router.post('/api/chat/message', RequireAuthentication, (req, res) =>
    controller.sendMessage(req, res)
  );

  return router;
};

export default ChatRouter;
