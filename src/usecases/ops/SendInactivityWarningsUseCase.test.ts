import { SendInactivityWarningsUseCase } from './SendInactivityWarningsUseCase';
import { InMemoryInactivityEmailRepository } from '../../data_layer/InactivityEmailRepository';
import type { IEmailService } from '../../services/EmailService/EmailService';

function makeEmailService(
  overrides: Partial<IEmailService> = {}
): IEmailService {
  return {
    sendResetEmail: jest.fn(),
    sendConversionEmail: jest.fn(),
    sendConversionLinkEmail: jest.fn(),
    sendContactEmail: jest.fn(),
    sendSubscriptionCancelledEmail: jest.fn(),
    sendSubscriptionScheduledCancellationEmail: jest.fn(),
    sendHostedAnkiAccessRequestEmail: jest.fn(),
    sendMagicLinkEmail: jest.fn(),
    sendReEngagementEmail: jest.fn(),
    sendInactivityWarningEmail: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('SendInactivityWarningsUseCase', () => {
  let repo: InMemoryInactivityEmailRepository;

  beforeEach(() => {
    repo = new InMemoryInactivityEmailRepository();
  });

  describe('dry run', () => {
    it('returns candidate count without sending emails', async () => {
      repo.seedUsers([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ]);
      const emailService = makeEmailService();
      const useCase = new SendInactivityWarningsUseCase(repo, emailService);

      const result = await useCase.execute(true);

      expect(result).toEqual({ count: 2, dryRun: true });
      expect(emailService.sendInactivityWarningEmail).not.toHaveBeenCalled();
      expect(repo.getSentUserIds().size).toBe(0);
    });

    it('returns zero when no candidates exist', async () => {
      const useCase = new SendInactivityWarningsUseCase(repo, makeEmailService());

      const result = await useCase.execute(true);

      expect(result).toEqual({ count: 0, dryRun: true });
    });
  });

  describe('live send', () => {
    it('sends emails and records sends for each candidate', async () => {
      repo.seedUsers([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ]);
      const emailService = makeEmailService();
      const useCase = new SendInactivityWarningsUseCase(repo, emailService);

      const result = await useCase.execute(false);

      expect(result).toEqual({ count: 2, dryRun: false });
      expect(emailService.sendInactivityWarningEmail).toHaveBeenCalledTimes(2);
      expect(emailService.sendInactivityWarningEmail).toHaveBeenCalledWith('alice@example.com');
      expect(emailService.sendInactivityWarningEmail).toHaveBeenCalledWith('bob@example.com');
      expect(repo.getSentUserIds()).toEqual(new Set([1, 2]));
    });

    it('continues sending to remaining users when one email fails', async () => {
      repo.seedUsers([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ]);
      const emailService = makeEmailService({
        sendInactivityWarningEmail: jest
          .fn()
          .mockRejectedValueOnce(new Error('SendGrid error'))
          .mockResolvedValueOnce(undefined),
      });
      const useCase = new SendInactivityWarningsUseCase(repo, emailService);

      const result = await useCase.execute(false);

      expect(result.count).toBe(1);
      expect(emailService.sendInactivityWarningEmail).toHaveBeenCalledTimes(2);
    });

    it('returns zero when no candidates exist', async () => {
      const useCase = new SendInactivityWarningsUseCase(repo, makeEmailService());

      const result = await useCase.execute(false);

      expect(result).toEqual({ count: 0, dryRun: false });
    });
  });
});
