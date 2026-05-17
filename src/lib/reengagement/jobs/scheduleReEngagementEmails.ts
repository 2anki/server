import type { IReEngagementRepository } from '../../../data_layer/ReEngagementRepository';
import type { IEmailService } from '../../../services/EmailService/EmailService';
import type { EventsSink } from '../../../services/events/EventsSink';
import { sendReEngagementEmails } from '../../storage/jobs/helpers/sendReEngagementEmails';

export const RE_ENGAGEMENT_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const scheduleReEngagementEmails = (
  repo: IReEngagementRepository,
  emailService: IEmailService,
  eventsSink: EventsSink,
  options: { intervalMs?: number } = {}
): NodeJS.Timeout => {
  const intervalMs = options.intervalMs ?? RE_ENGAGEMENT_INTERVAL_MS;

  const tick = async () => {
    try {
      const { count } = await sendReEngagementEmails(repo, emailService);
      console.info(`[re-engagement] sent ${count} email(s)`);
      eventsSink.record({
        name: 'email_batch_sent',
        props: { campaign: 'reengagement', count },
      });
    } catch (error) {
      console.error('[re-engagement] daily job failed:', error);
    }
  };

  const handle = setInterval(tick, intervalMs);
  handle.unref();
  return handle;
};
