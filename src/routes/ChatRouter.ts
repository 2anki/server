import express from 'express';
import ChatController from '../controllers/ChatController';
import ChatDeckController from '../controllers/ChatDeckController';
import { ChatUseCase } from '../usecases/chat/ChatUseCase';
import { ChatDeckUseCase } from '../usecases/chat/ChatDeckUseCase';
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
  const deckUseCase = new ChatDeckUseCase();
  const deckController = new ChatDeckController(deckUseCase);

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

  /**
   * @swagger
   * /api/chat/deck:
   *   post:
   *     summary: Generate an Anki deck from chat cards
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [cards, deckName]
   *             properties:
   *               deckName:
   *                 type: string
   *                 maxLength: 120
   *               cards:
   *                 type: array
   *                 maxItems: 200
   *                 items:
   *                   type: object
   *                   required: [front, back]
   *                   properties:
   *                     front:
   *                       type: string
   *                     back:
   *                       type: string
   *     responses:
   *       200:
   *         description: Anki .apkg file
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Invalid input
   */
  router.post('/api/chat/deck', RequireAuthentication, (req, res) =>
    deckController.generate(req, res)
  );

  /**
   * @swagger
   * /api/chat/usage:
   *   get:
   *     summary: Get chat usage for the current month
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usage data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 used:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *                   nullable: true
   */
  router.get('/api/chat/usage', RequireAuthentication, async (req, res) => {
    const owner = res.locals.owner as number;
    const patreon = (res.locals.patreon as boolean) ?? false;
    const count = await repo.countThisMonth(owner);
    res.status(200).json({
      used: count,
      limit: patreon ? null : 20,
    });
  });

  return router;
};

export default ChatRouter;
