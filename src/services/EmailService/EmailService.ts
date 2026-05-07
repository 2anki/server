import sgMail = require('@sendgrid/mail');
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

import {
  CONVERT_LINK_TEMPLATE,
  CONVERT_TEMPLATE,
  DEFAULT_SENDER,
  PASSWORD_RESET_TEMPLATE,
  SUBSCRIPTION_CANCELLED_TEMPLATE,
  SUBSCRIPTION_CANCELLATIONS_LOG_PATH,
  SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE,
} from './constants';
import { isValidDeckName, addDeckNameSuffix } from '../../lib/anki/format';
import { ClientResponse } from '@sendgrid/mail';
import { SUPPORT_EMAIL_ADDRESS } from '../../lib/constants';

type EmailResponse = { didSend: boolean; error?: Error };

export interface IEmailService {
  sendResetEmail(email: string, token: string): void;
  sendConversionEmail(email: string, filename: string, contents: Buffer): void;
  sendConversionLinkEmail(email: string, filename: string, link: string): void;
  sendContactEmail(
    name: string,
    email: string,
    message: string,
    attachments: Express.Multer.File[]
  ): Promise<EmailResponse>;
  sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    subscriptionId: string
  ): Promise<void>;
  sendSubscriptionScheduledCancellationEmail(
    email: string,
    name: string,
    cancelDate: Date
  ): Promise<void>;
  sendWeeklyRetroReminder(): Promise<void>;
  sendTriageFeedbackReminder(): Promise<void>;
  sendChangelogReminder(): Promise<void>;
}

export const TRIO_REMINDER_RECIPIENT = 'alexander@alemayhu.com';

const buildTrioReminderMessage = (
  defaultSender: string,
  subject: string,
  intro: string,
  command: string,
  costOfSkipping: string
) => {
  const text = [
    intro,
    '',
    `How: open the server repo in Claude Code and run ${command}.`,
    '',
    `Skipping costs: ${costOfSkipping}`,
    '',
    '— Trio reminder',
  ].join('\n');
  const html = `
    <p>${intro}</p>
    <p><strong>How:</strong> open the server repo in Claude Code and run <code>${command}</code>.</p>
    <p><strong>Skipping costs:</strong> ${costOfSkipping}</p>
    <p style="color:#888;margin-top:24px">— Trio reminder</p>
  `;
  return {
    to: TRIO_REMINDER_RECIPIENT,
    from: defaultSender,
    subject,
    text,
    html,
    replyTo: 'support@2anki.net',
  };
};

class EmailService implements IEmailService {
  constructor(
    apiKey: string,
    readonly defaultSender: string
  ) {
    sgMail.setApiKey(apiKey);
  }

  sendResetEmail(email: string, token: string) {
    const link = `${process.env.DOMAIN}/users/r/${token}`;
    const markup = PASSWORD_RESET_TEMPLATE.replace('{{link}}', link);
    const msg = {
      to: email,
      from: this.defaultSender,
      subject: 'Reset your 2anki.net password',
      text: `We received your password change request, you can change it here ${link}`,
      html: markup,
      replyTo: 'support@2anki.net',
    };

    sgMail.send(msg);
  }

  sendConversionEmail(
    email: string,
    filename: string,
    contents: Buffer
  ): Promise<[ClientResponse, {}]> {
    const markup = CONVERT_TEMPLATE;

    let attachedFilename = filename;
    if (!isValidDeckName(filename)) {
      attachedFilename = addDeckNameSuffix(filename);
    }
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: `2anki.net - Your «${filename}» deck is ready`,
      text: 'Attached is your deck',
      html: markup,
      replyTo: 'support@2anki.net',
      attachments: [
        {
          content: contents.toString('base64'),
          filename: attachedFilename,
          type: 'application/apkg',
          disposition: 'attachment',
        },
      ],
    };

    return sgMail.send(msg);
  }

  async sendConversionLinkEmail(email: string, filename: string, link: string) {
    const markup = CONVERT_LINK_TEMPLATE.replace(/{{link}}/g, link);
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: `2anki.net - Your «${filename}» deck is ready`,
      text: `Download your deck here: ${link}`,
      html: markup,
      replyTo: 'support@2anki.net',
    };

    await sgMail.send(msg);
  }

  async sendContactEmail(
    name: string,
    email: string,
    message: string,
    attachments: Express.Multer.File[]
  ): Promise<EmailResponse> {
    const msg = {
      to: SUPPORT_EMAIL_ADDRESS,
      from: DEFAULT_SENDER,
      subject: `Contact form submission on behalf of ${
        name ?? 'Anon'
      } <${email}>`,
      text: `Message: ${message}\n\n`,
      attachments: attachments.map((file) => ({
        content: file.buffer.toString('base64'),
        filename: file.originalname,
        type: file.mimetype,
        disposition: 'attachment',
      })),
    };
    try {
      await sgMail.send(msg);
      return { didSend: true };
    } catch (e) {
      console.error('Error sending email', e);
      return { didSend: false, error: e as Error };
    }
  }

  private loadCancellationsSent(): Set<string> {
    try {
      // Ensure .2anki directory exists
      const dir = path.dirname(SUBSCRIPTION_CANCELLATIONS_LOG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(SUBSCRIPTION_CANCELLATIONS_LOG_PATH)) {
        const data = fs.readFileSync(
          SUBSCRIPTION_CANCELLATIONS_LOG_PATH,
          'utf8'
        );
        return new Set(JSON.parse(data));
      }
    } catch (error) {
      console.warn('Error loading cancellations log:', error);
    }
    return new Set();
  }

  private saveCancellationSent(subscriptionId: string): void {
    try {
      const cancellationsSent = this.loadCancellationsSent();
      cancellationsSent.add(subscriptionId);
      fs.writeFileSync(
        SUBSCRIPTION_CANCELLATIONS_LOG_PATH,
        JSON.stringify([...cancellationsSent])
      );
    } catch (error) {
      console.error('Error saving cancellation log:', error);
    }
  }

  async sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    subscriptionId: string
  ): Promise<void> {
    const cancellationsSent = this.loadCancellationsSent();
    if (cancellationsSent.has(subscriptionId)) {
      console.log(
        `Skipping ${email} - Cancellation notification already sent for subscription ${subscriptionId}`
      );
      return;
    }

    const markup = SUBSCRIPTION_CANCELLED_TEMPLATE.replace(
      '{{name}}',
      name || 'there'
    );

    const $ = cheerio.load(markup);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const msg = {
      to: email,
      from: this.defaultSender,
      subject: '2anki.net - Subscription Cancelled',
      text,
      html: markup,
      replyTo: 'support@2anki.net',
    };

    try {
      await sgMail.send(msg);
      this.saveCancellationSent(subscriptionId);
      console.log(`Successfully sent cancellation confirmation to ${email}`);
    } catch (error) {
      console.error(
        `Failed to send cancellation confirmation to ${email}:`,
        error
      );
      throw error;
    }
  }

  async sendWeeklyRetroReminder(): Promise<void> {
    const msg = buildTrioReminderMessage(
      this.defaultSender,
      'Sunday reminder: run /weekly-retro and pick this week’s priority',
      'It’s time for the weekly retro. Pull this week’s numbers, identify the single biggest gap, and pick one priority shift for the coming week.',
      '/weekly-retro',
      'a week without a forced decision usually means five priorities that don’t ship.'
    );
    await sgMail.send(msg);
  }

  async sendTriageFeedbackReminder(): Promise<void> {
    const msg = buildTrioReminderMessage(
      this.defaultSender,
      'Friday reminder: run /triage-feedback on the last 2 weeks of input',
      'Time to triage accumulated user feedback. Cluster into themes, tie each to the goal, and draft GitHub issues for the high-urgency ones.',
      '/triage-feedback',
      'feedback piles up past ~20 items and the themes get noisy.'
    );
    await sgMail.send(msg);
  }

  async sendChangelogReminder(): Promise<void> {
    const msg = buildTrioReminderMessage(
      this.defaultSender,
      'Friday reminder: run /changelog on the last 2 weeks of merged PRs',
      'Time to turn merged PRs into a user-facing changelog. Both an in-app modal entry and a blog post seed.',
      '/changelog',
      'skipping breaks the SEO/distribution loop and users miss the improvements.'
    );
    await sgMail.send(msg);
  }

  async sendSubscriptionScheduledCancellationEmail(
    email: string,
    name: string,
    cancelDate: Date
  ): Promise<void> {
    const formattedDate = cancelDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const markup = SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE.replace(
      '{{name}}',
      name || 'there'
    ).replace(/{{cancelDate}}/g, formattedDate);

    const $ = cheerio.load(markup);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const msg = {
      to: email,
      from: this.defaultSender,
      subject: '2anki.net - Subscription Cancellation Scheduled',
      text,
      html: markup,
      replyTo: 'support@2anki.net',
    };

    try {
      await sgMail.send(msg);
      console.log(
        `Successfully sent scheduled cancellation notification to ${email}`
      );
    } catch (error) {
      console.error(
        `Failed to send scheduled cancellation notification to ${email}:`,
        error
      );
      throw error;
    }
  }
}

export class UnimplementedEmailService implements IEmailService {
  sendResetEmail(email: string, token: string): void {
    console.info('sendResetEmail not handled', email, token);
  }

  sendConversionEmail(email: string, filename: string, contents: Buffer): void {
    console.info('sendConversionEmail not handled', email, filename, contents);
  }

  sendConversionLinkEmail(email: string, filename: string, link: string): void {
    console.info('sendConversionLinkEmail not handled', email, filename, link);
  }

  sendContactEmail(
    name: string,
    email: string,
    message: string,
    attachments: Express.Multer.File[]
  ): Promise<EmailResponse> {
    console.info(
      'sendContactEmail not handled',
      name,
      email,
      message,
      attachments
    );
    return Promise.resolve({ didSend: false });
  }

  sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    subscriptionId: string
  ): Promise<void> {
    console.info(
      'sendSubscriptionCancelledEmail not handled',
      email,
      name,
      subscriptionId
    );
    return Promise.resolve();
  }

  sendSubscriptionScheduledCancellationEmail(
    email: string,
    name: string,
    cancelDate: Date
  ): Promise<void> {
    console.info(
      'sendSubscriptionScheduledCancellationEmail not handled',
      email,
      name,
      cancelDate
    );
    return Promise.resolve();
  }

  sendWeeklyRetroReminder(): Promise<void> {
    console.info('sendWeeklyRetroReminder not handled');
    return Promise.resolve();
  }

  sendTriageFeedbackReminder(): Promise<void> {
    console.info('sendTriageFeedbackReminder not handled');
    return Promise.resolve();
  }

  sendChangelogReminder(): Promise<void> {
    console.info('sendChangelogReminder not handled');
    return Promise.resolve();
  }
}

export const getDefaultEmailService = () => {
  if (process.env.SENDGRID_API_KEY !== undefined) {
    return new EmailService(process.env.SENDGRID_API_KEY!, DEFAULT_SENDER);
  }
  return new UnimplementedEmailService();
};
