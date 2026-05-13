import { InMemoryReEngagementRepository } from './ReEngagementRepository';

describe('InMemoryReEngagementRepository', () => {
  describe('hasBeenSent', () => {
    it('returns false when no email has been sent to the user', async () => {
      const repo = new InMemoryReEngagementRepository();

      const result = await repo.hasBeenSent(42);

      expect(result).toBe(false);
    });

    it('returns true after recordSend is called for the user', async () => {
      const repo = new InMemoryReEngagementRepository();
      await repo.recordSend(42, 'abc123');

      const result = await repo.hasBeenSent(42);

      expect(result).toBe(true);
    });
  });

  describe('recordSend', () => {
    it('returns a numeric email id', async () => {
      const repo = new InMemoryReEngagementRepository();

      const id = await repo.recordSend(1, 'token-one');

      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('returns incrementing ids for successive calls', async () => {
      const repo = new InMemoryReEngagementRepository();

      const id1 = await repo.recordSend(1, 'tok1');
      const id2 = await repo.recordSend(2, 'tok2');

      expect(id2).toBeGreaterThan(id1);
    });
  });

  describe('findByToken', () => {
    it('returns null when token does not exist', async () => {
      const repo = new InMemoryReEngagementRepository();

      const result = await repo.findByToken('ghost');

      expect(result).toBeNull();
    });

    it('returns id and userId when token exists', async () => {
      const repo = new InMemoryReEngagementRepository();
      const emailId = await repo.recordSend(7, 'my-token');

      const result = await repo.findByToken('my-token');

      expect(result).toEqual({ id: emailId, userId: 7 });
    });
  });

  describe('saveResponse', () => {
    it('stores the response linked to the email id', async () => {
      const repo = new InMemoryReEngagementRepository();
      const emailId = await repo.recordSend(3, 'resp-token');

      await repo.saveResponse(emailId, 'too_complex', 'notion', 'Hard to use');

      const responses = repo.getResponses();
      expect(responses).toHaveLength(1);
      expect(responses[0]).toMatchObject({
        emailId,
        stoppedReason: 'too_complex',
        contentType: 'notion',
        comment: 'Hard to use',
      });
    });

    it('stores null comment when comment is null', async () => {
      const repo = new InMemoryReEngagementRepository();
      const emailId = await repo.recordSend(4, 'null-comment-token');

      await repo.saveResponse(emailId, 'forgot', 'upload', null);

      expect(repo.getResponses()[0].comment).toBeNull();
    });
  });

  describe('getUsersToEmail', () => {
    it('returns seeded users that have not been sent an email', async () => {
      const repo = new InMemoryReEngagementRepository();
      repo.seedUsers([
        { id: 10, name: 'Alice', email: 'alice@example.com' },
        { id: 11, name: 'Bob', email: 'bob@example.com' },
      ]);

      const users = await repo.getUsersToEmail();

      expect(users).toHaveLength(2);
    });

    it('excludes users who have already received an email', async () => {
      const repo = new InMemoryReEngagementRepository();
      repo.seedUsers([
        { id: 10, name: 'Alice', email: 'alice@example.com' },
        { id: 11, name: 'Bob', email: 'bob@example.com' },
      ]);
      await repo.recordSend(10, 'alice-token');

      const users = await repo.getUsersToEmail();

      expect(users).toHaveLength(1);
      expect(users[0].id).toBe(11);
    });

    it('returns empty array when all users have been sent an email', async () => {
      const repo = new InMemoryReEngagementRepository();
      repo.seedUsers([{ id: 5, name: 'Charlie', email: 'charlie@example.com' }]);
      await repo.recordSend(5, 'charlie-token');

      const users = await repo.getUsersToEmail();

      expect(users).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('resets all state', async () => {
      const repo = new InMemoryReEngagementRepository();
      repo.seedUsers([{ id: 1, name: 'Alice', email: 'alice@example.com' }]);
      await repo.recordSend(1, 'tok');
      repo.clear();

      expect(await repo.hasBeenSent(1)).toBe(false);
      expect(await repo.getUsersToEmail()).toHaveLength(0);
    });
  });
});
