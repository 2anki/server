import { InMemoryEmailPreferencesRepository } from './EmailPreferencesRepository';

describe('InMemoryEmailPreferencesRepository', () => {
  describe('isOptedOut', () => {
    it('returns false when no preference row exists for the user', async () => {
      const repo = new InMemoryEmailPreferencesRepository();

      const result = await repo.isOptedOut(42);

      expect(result).toBe(false);
    });

    it('returns true after optOut is called', async () => {
      const repo = new InMemoryEmailPreferencesRepository();
      await repo.optOut(42);

      const result = await repo.isOptedOut(42);

      expect(result).toBe(true);
    });

    it('returns false after optIn is called following an optOut', async () => {
      const repo = new InMemoryEmailPreferencesRepository();
      await repo.optOut(42);
      await repo.optIn(42);

      const result = await repo.isOptedOut(42);

      expect(result).toBe(false);
    });
  });

  describe('optOut', () => {
    it('is idempotent — second call does not change the result', async () => {
      const repo = new InMemoryEmailPreferencesRepository();
      await repo.optOut(7);
      await repo.optOut(7);

      const result = await repo.isOptedOut(7);

      expect(result).toBe(true);
    });
  });

  describe('optIn', () => {
    it('is idempotent — second call does not change the result', async () => {
      const repo = new InMemoryEmailPreferencesRepository();
      await repo.optIn(7);
      await repo.optIn(7);

      const result = await repo.isOptedOut(7);

      expect(result).toBe(false);
    });
  });
});
