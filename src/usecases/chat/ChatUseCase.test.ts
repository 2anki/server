import { ChatUseCase, ChatRateLimitError } from './ChatUseCase';
import { InMemoryChatMessagesRepository } from '../../data_layer/ChatMessagesRepository';

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

describe('ChatUseCase', () => {
  describe('message counting and rate limiting', () => {
    it('throws ChatRateLimitError when free user has used 20 messages this month', async () => {
      const repo = new InMemoryChatMessagesRepository();
      for (let i = 0; i < 20; i++) {
        await repo.insert({ userId: FREE_USER.owner, role: 'user', content: `msg ${i}` });
      }
      const anthropic = buildAnthropicMock('Hello');
      const useCase = new ChatUseCase(repo, anthropic as never);

      await expect(
        useCase.execute({ user: FREE_USER, content: 'another message', conversationHistory: [] })
      ).rejects.toBeInstanceOf(ChatRateLimitError);
    });

    it('does not throw when free user has used fewer than 20 messages', async () => {
      const repo = new InMemoryChatMessagesRepository();
      for (let i = 0; i < 19; i++) {
        await repo.insert({ userId: FREE_USER.owner, role: 'user', content: `msg ${i}` });
      }
      const anthropic = buildAnthropicMock('Nice response');
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'question',
        conversationHistory: [],
      });
      expect(result.content).toBe('Nice response');
    });

    it('does not apply limit to patreon users', async () => {
      const repo = new InMemoryChatMessagesRepository();
      for (let i = 0; i < 100; i++) {
        await repo.insert({ userId: PATREON_USER.owner, role: 'user', content: `msg ${i}` });
      }
      const anthropic = buildAnthropicMock('Patreon response');
      const useCase = new ChatUseCase(repo, anthropic as never);

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
      const repo = new InMemoryChatMessagesRepository();
      const anthropic = buildAnthropicMock('answer');
      const useCase = new ChatUseCase(repo, anthropic as never);

      await useCase.execute({ user: FREE_USER, content: 'question', conversationHistory: [] });

      expect(anthropic.messages.stream).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-haiku-4-5-20251001' })
      );
    });

    it('uses sonnet model for patreon users', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const anthropic = buildAnthropicMock('answer');
      const useCase = new ChatUseCase(repo, anthropic as never);

      await useCase.execute({ user: PATREON_USER, content: 'question', conversationHistory: [] });

      expect(anthropic.messages.stream).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-sonnet-4-6' })
      );
    });
  });

  describe('card extraction', () => {
    it('extracts cards when response contains a JSON code block', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const cards = [{ front: 'Q1', back: 'A1' }, { front: 'Q2', back: 'A2' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const anthropic = buildAnthropicMock(responseText);
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards about photosynthesis',
        conversationHistory: [],
      });

      expect(result.cards).toEqual(cards);
    });

    it('returns no cards when response has no JSON block', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const anthropic = buildAnthropicMock('Photosynthesis is the process by which...');
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Explain photosynthesis',
        conversationHistory: [],
      });

      expect(result.cards).toBeUndefined();
    });

    it('returns no cards when JSON block is not a front/back array', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const responseText = 'Here is JSON:\n```json\n{"key": "value"}\n```';
      const anthropic = buildAnthropicMock(responseText);
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'some question',
        conversationHistory: [],
      });

      expect(result.cards).toBeUndefined();
    });

    it('returns contentBefore and contentAfter when JSON block is surrounded by prose', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const anthropic = buildAnthropicMock(responseText);
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBe('Here are your cards:');
      expect(result.contentAfter).toBe('Hope that helps!');
    });

    it('returns contentBefore as undefined when no text before JSON block', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `\`\`\`json\n${JSON.stringify(cards)}\n\`\`\`\nHope that helps!`;
      const anthropic = buildAnthropicMock(responseText);
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBeUndefined();
      expect(result.contentAfter).toBe('Hope that helps!');
    });

    it('returns contentAfter as undefined when no text after JSON block', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const cards = [{ front: 'Q1', back: 'A1' }];
      const responseText = `Here are your cards:\n\`\`\`json\n${JSON.stringify(cards)}\n\`\`\``;
      const anthropic = buildAnthropicMock(responseText);
      const useCase = new ChatUseCase(repo, anthropic as never);

      const result = await useCase.execute({
        user: FREE_USER,
        content: 'Make cards',
        conversationHistory: [],
      });

      expect(result.contentBefore).toBe('Here are your cards:');
      expect(result.contentAfter).toBeUndefined();
    });

    it('returns undefined contentBefore and contentAfter when no JSON block present', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const anthropic = buildAnthropicMock('Just plain text response.');
      const useCase = new ChatUseCase(repo, anthropic as never);

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
    it('saves both user and assistant messages', async () => {
      const repo = new InMemoryChatMessagesRepository();
      const anthropic = buildAnthropicMock('Assistant reply');
      const useCase = new ChatUseCase(repo, anthropic as never);

      await useCase.execute({
        user: FREE_USER,
        content: 'User question',
        conversationHistory: [],
      });

      const all = repo.getAll();
      expect(all).toHaveLength(2);
      expect(all[0]).toMatchObject({ user_id: FREE_USER.owner, role: 'user', content: 'User question' });
      expect(all[1]).toMatchObject({ user_id: FREE_USER.owner, role: 'assistant', content: 'Assistant reply' });
    });
  });

  describe('ChatRateLimitError', () => {
    it('provides a resetDate as the first of next month', async () => {
      const repo = new InMemoryChatMessagesRepository();
      for (let i = 0; i < 20; i++) {
        await repo.insert({ userId: FREE_USER.owner, role: 'user', content: `msg ${i}` });
      }
      const anthropic = buildAnthropicMock('');
      const useCase = new ChatUseCase(repo, anthropic as never);

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
