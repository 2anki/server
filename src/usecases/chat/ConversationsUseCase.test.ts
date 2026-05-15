import { ConversationsUseCase, InvalidTitleError } from './ConversationsUseCase';
import { InMemoryConversationsRepository } from '../../data_layer/ConversationsRepository';

const USER_A = 1;
const USER_B = 2;

describe('ConversationsUseCase', () => {
  describe('list', () => {
    it('returns only the calling user\'s conversations, newest first', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);

      const first = await repo.create({ userId: USER_A, title: 'First' });
      const second = await repo.create({ userId: USER_A, title: 'Second' });
      await repo.create({ userId: USER_B, title: 'Theirs' });

      const list = await useCase.list(USER_A);
      expect(list.map((c) => c.id)).toEqual([second, first]);
    });

    it('excludes soft-deleted conversations', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);

      const keep = await repo.create({ userId: USER_A, title: 'Keep' });
      const drop = await repo.create({ userId: USER_A, title: 'Drop' });
      await repo.softDelete({ userId: USER_A, conversationId: drop });

      const list = await useCase.list(USER_A);
      expect(list.map((c) => c.id)).toEqual([keep]);
    });
  });

  describe('get', () => {
    it('returns null for another user\'s conversation', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);

      const id = await repo.create({ userId: USER_B, title: 'Theirs' });
      const result = await useCase.get({ userId: USER_A, conversationId: id });

      expect(result).toBeNull();
    });

    it('returns the conversation with ordered messages', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);

      const id = await repo.create({ userId: USER_A, title: 'Conversation' });
      repo.recordMessage({ userId: USER_A, conversationId: id, role: 'user', content: 'hello' });
      repo.recordMessage({ userId: USER_A, conversationId: id, role: 'assistant', content: 'hi' });

      const result = await useCase.get({ userId: USER_A, conversationId: id });
      expect(result?.messages).toEqual([
        expect.objectContaining({ role: 'user', content: 'hello' }),
        expect.objectContaining({ role: 'assistant', content: 'hi' }),
      ]);
    });
  });

  describe('rename', () => {
    it('rejects empty titles', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_A, title: 'old' });

      await expect(
        useCase.rename({ userId: USER_A, conversationId: id, title: '   ' })
      ).rejects.toBeInstanceOf(InvalidTitleError);
    });

    it('rejects overly long titles', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_A, title: 'old' });

      await expect(
        useCase.rename({ userId: USER_A, conversationId: id, title: 'x'.repeat(121) })
      ).rejects.toBeInstanceOf(InvalidTitleError);
    });

    it('updates the title when valid', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_A, title: 'old' });

      const ok = await useCase.rename({ userId: USER_A, conversationId: id, title: '  fresh title  ' });
      expect(ok).toBe(true);
      const conv = await useCase.get({ userId: USER_A, conversationId: id });
      expect(conv?.title).toBe('fresh title');
    });

    it('returns false when renaming another user\'s conversation', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_B, title: 'theirs' });

      const ok = await useCase.rename({ userId: USER_A, conversationId: id, title: 'mine now' });
      expect(ok).toBe(false);
    });
  });

  describe('delete', () => {
    it('soft-deletes the conversation', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_A, title: 'gone' });

      const ok = await useCase.delete({ userId: USER_A, conversationId: id });
      expect(ok).toBe(true);
      expect(await useCase.list(USER_A)).toEqual([]);
    });

    it('returns false when deleting another user\'s conversation', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_B, title: 'theirs' });

      const ok = await useCase.delete({ userId: USER_A, conversationId: id });
      expect(ok).toBe(false);
    });

    it('returns false on the second delete', async () => {
      const repo = new InMemoryConversationsRepository();
      const useCase = new ConversationsUseCase(repo);
      const id = await repo.create({ userId: USER_A, title: 'gone' });

      await useCase.delete({ userId: USER_A, conversationId: id });
      const second = await useCase.delete({ userId: USER_A, conversationId: id });
      expect(second).toBe(false);
    });
  });
});
