import crypto from 'crypto';

import type { IReEngagementRepository } from '../../../../data_layer/ReEngagementRepository';
import type { IEmailService } from '../../../../services/EmailService/EmailService';

export async function sendReEngagementEmails(
  repo: IReEngagementRepository,
  emailService: IEmailService
): Promise<void> {
  const users = await repo.getUsersToEmail();

  for (const user of users) {
    const token = crypto.randomBytes(32).toString('hex');
    const emailId = await repo.recordSend(user.id, token);
    void emailId;
    try {
      await emailService.sendReEngagementEmail(user.email, user.name, token);
    } catch (error) {
      console.error(`[re-engagement] failed to email user ${user.id}:`, error);
    }
  }
}
