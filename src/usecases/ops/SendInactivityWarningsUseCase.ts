import type { IInactivityEmailRepository } from '../../data_layer/InactivityEmailRepository';
import type { IEmailService } from '../../services/EmailService/EmailService';

export interface SendInactivityWarningsResult {
  count: number;
  dryRun: boolean;
}

export class SendInactivityWarningsUseCase {
  constructor(
    private readonly repo: IInactivityEmailRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(dryRun: boolean, limit = 500): Promise<SendInactivityWarningsResult> {
    const users = await this.repo.getUsersToNotify(limit);

    if (dryRun) {
      return { count: users.length, dryRun: true };
    }

    let sent = 0;
    for (const user of users) {
      await this.repo.recordSend(user.id, crypto.randomUUID());
      try {
        await this.emailService.sendInactivityWarningEmail(user.email);
        sent++;
      } catch (error) {
        console.error(`[inactivity] failed to email user ${user.id}:`, error);
      }
    }

    return { count: sent, dryRun: false };
  }
}
