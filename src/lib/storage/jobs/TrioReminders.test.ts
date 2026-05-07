import { handleFridayReminder, handleHourlyTick } from './TrioReminders';
import { IEmailService } from '../../../services/EmailService/EmailService';

const buildEmailService = (): jest.Mocked<IEmailService> =>
  ({
    sendResetEmail: jest.fn(),
    sendConversionEmail: jest.fn(),
    sendConversionLinkEmail: jest.fn(),
    sendContactEmail: jest.fn(),
    sendSubscriptionCancelledEmail: jest.fn(),
    sendSubscriptionScheduledCancellationEmail: jest.fn(),
    sendWeeklyRetroReminder: jest.fn().mockResolvedValue(undefined),
    sendTriageFeedbackReminder: jest.fn().mockResolvedValue(undefined),
    sendChangelogReminder: jest.fn().mockResolvedValue(undefined),
  }) as unknown as jest.Mocked<IEmailService>;

describe('handleFridayReminder', () => {
  it('sends the triage reminder on even ISO weeks', async () => {
    const emailService = buildEmailService();
    const evenWeekFriday = new Date('2026-01-09T09:00:00+01:00');

    await handleFridayReminder(emailService, evenWeekFriday);

    expect(emailService.sendTriageFeedbackReminder).toHaveBeenCalledTimes(1);
    expect(emailService.sendChangelogReminder).not.toHaveBeenCalled();
  });

  it('sends the changelog reminder on odd ISO weeks', async () => {
    const emailService = buildEmailService();
    const oddWeekFriday = new Date('2026-01-02T09:00:00+01:00');

    await handleFridayReminder(emailService, oddWeekFriday);

    expect(emailService.sendChangelogReminder).toHaveBeenCalledTimes(1);
    expect(emailService.sendTriageFeedbackReminder).not.toHaveBeenCalled();
  });
});

describe('handleHourlyTick', () => {
  const SUNDAY_18_OSLO = new Date('2026-05-10T16:00:00Z');
  const SUNDAY_19_OSLO = new Date('2026-05-10T17:00:00Z');
  const FRIDAY_9_OSLO_ODD_WEEK = new Date('2026-05-08T07:00:00Z');
  const TUESDAY_18_OSLO = new Date('2026-05-12T16:00:00Z');

  it('sends the weekly retro on Sunday 18:00 Oslo', async () => {
    const emailService = buildEmailService();

    await handleHourlyTick(emailService, new Map(), SUNDAY_18_OSLO);

    expect(emailService.sendWeeklyRetroReminder).toHaveBeenCalledTimes(1);
  });

  it('does not send the retro outside Sunday 18:00', async () => {
    const emailService = buildEmailService();

    await handleHourlyTick(emailService, new Map(), TUESDAY_18_OSLO);
    await handleHourlyTick(emailService, new Map(), SUNDAY_19_OSLO);

    expect(emailService.sendWeeklyRetroReminder).not.toHaveBeenCalled();
  });

  it('does not send the retro twice on the same day', async () => {
    const emailService = buildEmailService();
    const lastFired = new Map();

    await handleHourlyTick(emailService, lastFired, SUNDAY_18_OSLO);
    await handleHourlyTick(emailService, lastFired, SUNDAY_18_OSLO);

    expect(emailService.sendWeeklyRetroReminder).toHaveBeenCalledTimes(1);
  });

  it('routes Friday 09:00 Oslo to the biweekly handler', async () => {
    const emailService = buildEmailService();

    await handleHourlyTick(emailService, new Map(), FRIDAY_9_OSLO_ODD_WEEK);

    expect(emailService.sendChangelogReminder).toHaveBeenCalledTimes(1);
  });
});
