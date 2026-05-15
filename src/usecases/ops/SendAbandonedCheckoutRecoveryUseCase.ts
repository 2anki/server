import { IEmailService } from '../../services/EmailService/EmailService';

export interface SendAbandonedCheckoutRecoveryResult {
  dryRun: boolean;
  candidates: number;
  sent: number;
  failed: number;
  failures: { email: string; error: string }[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SendAbandonedCheckoutRecoveryUseCase {
  constructor(private readonly emailService: IEmailService) {}

  async execute(
    emails: string[],
    dryRun = true
  ): Promise<SendAbandonedCheckoutRecoveryResult> {
    const unique = Array.from(
      new Set(
        emails
          .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
          .filter((e) => e.length > 0 && EMAIL_RE.test(e))
      )
    );

    if (dryRun) {
      return {
        dryRun: true,
        candidates: unique.length,
        sent: 0,
        failed: 0,
        failures: [],
      };
    }

    const failures: { email: string; error: string }[] = [];
    let sent = 0;
    for (const email of unique) {
      try {
        await this.emailService.sendAbandonedCheckoutRecoveryEmail(email);
        sent += 1;
      } catch (error) {
        failures.push({
          email,
          error: error instanceof Error ? error.message : 'unknown',
        });
      }
    }

    return {
      dryRun: false,
      candidates: unique.length,
      sent,
      failed: failures.length,
      failures,
    };
  }
}
