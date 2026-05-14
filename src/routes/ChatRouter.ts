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

  router.post('/api/chat/message', RequireAuthentication, (req, res) =>
    controller.sendMessage(req, res)
  );

  return router;
};

export default ChatRouter;
