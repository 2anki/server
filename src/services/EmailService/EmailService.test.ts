jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 } as never, {}]),
}));

import sgMail = require('@sendgrid/mail');
import { getDefaultEmailService } from './EmailService';

const TRIO_REMINDER_RECIPIENT = 'alexander@alemayhu.com';

describe('EmailService trio reminders', () => {
  beforeEach(() => {
    process.env.SENDGRID_API_KEY = 'test-key';
    (sgMail.send as jest.Mock).mockClear();
  });

  it('sends the weekly retro reminder only to Alexander', async () => {
    const service = getDefaultEmailService();

    await service.sendWeeklyRetroReminder();

    const msg = (sgMail.send as jest.Mock).mock.calls[0][0];
    expect(msg.to).toBe(TRIO_REMINDER_RECIPIENT);
    expect(msg.subject.toLowerCase()).toContain('/weekly-retro');
  });

  it('sends the triage feedback reminder only to Alexander', async () => {
    const service = getDefaultEmailService();

    await service.sendTriageFeedbackReminder();

    const msg = (sgMail.send as jest.Mock).mock.calls[0][0];
    expect(msg.to).toBe(TRIO_REMINDER_RECIPIENT);
    expect(msg.subject.toLowerCase()).toContain('/triage-feedback');
  });

  it('sends the changelog reminder only to Alexander', async () => {
    const service = getDefaultEmailService();

    await service.sendChangelogReminder();

    const msg = (sgMail.send as jest.Mock).mock.calls[0][0];
    expect(msg.to).toBe(TRIO_REMINDER_RECIPIENT);
    expect(msg.subject.toLowerCase()).toContain('/changelog');
  });
});
