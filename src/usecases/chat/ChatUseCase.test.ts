import {
  ChatUseCase,
  ChatRateLimitError,
  ChatConversationNotFoundError,
} from './ChatUseCase';
import { InMemoryChatMessagesRepository } from '../../data_layer/ChatMessagesRepository';
import { InMemoryConversationsRepository } from '../../data_layer/ConversationsRepository';

const FREE_USER = { owner: 1, patreon: false } as const;
const PATREON_USER = { owner: 2, patreon: true } as const;

function buildAnthropicMock(responseContent: string) {
  const mockStream = {
    on: jest.fn().mockReturnThis(),
    finalMessage: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: responseContent }],
    }),
  };
  return {
    messages: {
      stream: jest.fn().mockReturnValue(mockStream),
    },
  };
}

function buildUseCase(responseContent: string) {
  const messagesRepo = new InMemoryChatMessagesRepository();
  const conversationsRepo = new InMemoryConversationsRepository();
  const anthropic = buildAnthropicMock(responseContent);
  const useCase = new ChatUseCase(messagesRepo, conversationsRepo, anthropic as never);
  return { messagesRepo, conversationsRepo, anthropic, useCase };
}

describe('ChatUseCase', () => {
  describe('message counting and rate limiting', () => {
    it('throws ChatRateLimitError when free user has used 20 messages this month', async () => {
      const { messagesRepo, useCase } = buildUseCase('Hello');
      for (let i = 0; i < 20; i++) {
        await messagesRepo.insert({
          userId: FREE_USER.owner,
          conversationId: null,
          role: 'user',
          content: `msg ${i}`,
        });
      }

      await expect(
        useCase.execute({ user: FREE_USER, content: 'another message', conversationHistory: [] })
      ).rejects.toBeInstanceOf(ChatRateLimitError);
    });

    it('does not throw when free user has used fewer than 20 messages', async () => {
      const { messagesRepo, useCase } = buildUseCase('Nice response');
      for (let i = 0; i < 19; i++) {
        await messagesRepo.insert({
          userId: FREE_USER.owner,
          conversationId: null,
          role: 'user',
          content: `msg ${i}`,
        });
      }

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'question',
        conversationHistory: [],
      });
      expect(result.content).toBe('Nice response');
    });

    it('does not apply limit to patreon users', async () => {
      const { messagesRepo, useCase } = buildUseCase('Patreon response');
      for (let i = 0; i < 100; i++) {
        await messagesRepo.insert({
          userId: PATREON_USER.owner,
          conversationId: null,
          role: 'user',
          content: `msg ${i}`,
        });
      }

      const result = await useCase.execute({
        user: PATREON_USER,
        content: 'question',
        conversationHistory: [],
      });
      expect(result.content).toBe('Patreon response');
    });
  });

  describe('model selection', () => {
    it('uses haiku model for free users', async () => {
      const { anthropic, useCase } = buildUseCase('answer');

      await useCase.execute({ user: FREE_USER, content: 'question', conversationHistory: [] });

      expect(anthropic.messages.stream).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-haiku-4-5-20251001' })
      );
    });

    it('uses sonnet model for patreon users', async () => {
      const { anthropic, useCase } = buildUseCase('answer');

      await useCase.execute({ user: PATREON_USER, content: 'question', conversationHistory: [] });

      expect(anthropic.messages.stream).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-sonnet-4-6' })
      );
    });
  });

  describe('card extraction', () => {
    it('extracts cards when response contains a JSON code block', async () => {
      const cards = [{ front: 'Q1', back: 'A1' }, { front: 'Q2', back: 'A2' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const { useCase } = buildUseCase(responseText);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards about photosynthesis',
        conversationHistory: [],
      });

      expect(result.cards).toEqual(cards);
    });

    it('returns no cards when response has no JSON block', async () => {
      const { useCase } = buildUseCase('Photosynthesis is the process by which...');

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Explain photosynthesis',
        conversationHistory: [],
      });

      expect(result.cards).toBeUndefined();
    });

    it('returns no cards when JSON block is not a front/back array', async () => {
      const responseText = 'Here is JSON:\n```json\n{"key": "value"}\n```';
      const { useCase } = buildUseCase(responseText);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'some question',
        conversationHistory: [],
      });

      expect(result.cards).toBeUndefined();
    });

    it('returns contentBefore and contentAfter when JSON block is surrounded by prose', async () => {
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const { useCase } = buildUseCase(responseText);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBe('Here are your cards:');
      expect(result.contentAfter).toBe('Hope that helps!');
    });

    it('returns contentBefore as undefined when no text before JSON block', async () => {
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const { useCase } = buildUseCase(responseText);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBeUndefined();
      expect(result.contentAfter).toBe('Hope that helps!');
    });

    it('returns contentAfter as undefined when no text after JSON block', async () => {
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\``;
      const { useCase } = buildUseCase(responseText);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBe('Here are your cards:');
      expect(result.contentAfter).toBeUndefined();
    });

    it('returns undefined contentBefore and contentAfter when no JSON block present', async () => {
      const { useCase } = buildUseCase('Just plain text response.');

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Explain something',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBeUndefined();
      expect(result.contentAfter).toBeUndefined();
    });
  });

  describe('message persistence', () => {
    it('saves both user and assistant messages with the same conversation_id', async () => {
      const { messagesRepo, useCase } = buildUseCase('Assistant reply');

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'User question',
        conversationHistory: [],
      });

      const all = messagesRepo.getAll();
      expect(all).toHaveLength(2);
      expect(all[0]).toMatchObject({
        user_id: FREE_USER.owner,
        role: 'user',
        content: 'User question',
        conversation_id: result.conversationId,
      });
      expect(all[1]).toMatchObject({
        user_id: FREE_USER.owner,
        role: 'assistant',
        content: 'Assistant reply',
        conversation_id: result.conversationId,
      });
    });
  });

  describe('conversation management', () => {
    it('creates a new conversation when no conversationId is provided', async () => {
      const { conversationsRepo, useCase } = buildUseCase('reply');

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Hello there',
        conversationHistory: [],
      });

      const list = await conversationsRepo.listForUser(FREE_USER.owner);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(result.conversationId);
    });

    it('auto-titles the new conversation from the first user message', async () => {
      const { conversationsRepo, useCase } = buildUseCase('reply');

      await useCase.execute({
        user: FREE_USER,
        content: 'Explain mitosis briefly please',
        conversationHistory: [],
      });

      const list = await conversationsRepo.listForUser(FREE_USER.owner);
      expect(list[0].title).toBe('Explain mitosis briefly please');
    });

    it('truncates long auto-titles with an ellipsis', async () => {
      const { conversationsRepo, useCase } = buildUseCase('reply');
      const longInput =
        'This is a very long opening user message that absolutely will exceed the auto title cap of sixty characters by a wide margin.';

      await useCase.execute({
        user: FREE_USER,
        content: longInput,
        conversationHistory: [],
      });

      const list = await conversationsRepo.listForUser(FREE_USER.owner);
      expect(list[0].title.length).toBeLessThanOrEqual(61);
      expect(list[0].title.endsWith('…')).toBe(true);
    });

    it('reuses an existing conversation when a valid conversationId is provided', async () => {
      const { conversationsRepo, messagesRepo, useCase } = buildUseCase('reply');
      const existingId = await conversationsRepo.create({
        userId: FREE_USER.owner,
        title: 'Already here',
      });

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'follow-up',
        conversationHistory: [],
        conversationId: existingId,
      });

      expect(result.conversationId).toBe(existingId);
      const all = messagesRepo.getAll();
      expect(all.every((m) => m.conversation_id === existingId)).toBe(true);
      const list = await conversationsRepo.listForUser(FREE_USER.owner);
      expect(list).toHaveLength(1);
    });

    it('throws ChatConversationNotFoundError when the conversationId does not exist', async () => {
      const { useCase } = buildUseCase('reply');

      await expect(
        useCase.execute({
          user: FREE_USER,
          content: 'nope',
          conversationHistory: [],
          conversationId: 9999,
        })
      ).rejects.toBeInstanceOf(ChatConversationNotFoundError);
    });

    it('throws ChatConversationNotFoundError when the conversationId belongs to another user', async () => {
      const { conversationsRepo, useCase } = buildUseCase('reply');
      const theirs = await conversationsRepo.create({
        userId: PATREON_USER.owner,
        title: 'Theirs',
      });

      await expect(
        useCase.execute({
          user: FREE_USER,
          content: 'sneaky',
          conversationHistory: [],
          conversationId: theirs,
        })
      ).rejects.toBeInstanceOf(ChatConversationNotFoundError);
    });
  });

  describe('ChatRateLimitError', () => {
    it('provides a resetDate as the first of next month', async () => {
      const { messagesRepo, useCase } = buildUseCase('');
      for (let i = 0; i < 20; i++) {
        await messagesRepo.insert({
          userId: FREE_USER.owner,
          conversationId: null,
          role: 'user',
          content: `msg ${i}`,
        });
      }

      let caughtError: ChatRateLimitError | null = null;
      try {
        await useCase.execute({ user: FREE_USER, content: 'more', conversationHistory: [] });
      } catch (err) {
        if (err instanceof ChatRateLimitError) {
          caughtError = err;
        }
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError?.resetDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
