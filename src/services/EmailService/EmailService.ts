import sgMail = require('@sendgrid/mail');
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

import {
  CONVERT_LINK_TEMPLATE,
  CONVERT_TEMPLATE,
  DEFAULT_SENDER,
  PASSWORD_RESET_TEMPLATE,
  VAT_NOTIFICATION_TEMPLATE,
  VAT_NOTIFICATIONS_LOG_PATH,
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
  sendVatNotificationEmail(
    email: string,
    currency: string,
    name: string
  ): Promise<void>;
}

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

  private loadVatNotificationsSent(): Set<string> {
    try {
      // Ensure .2anki directory exists
      const dir = path.dirname(VAT_NOTIFICATIONS_LOG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(VAT_NOTIFICATIONS_LOG_PATH)) {
        const data = fs.readFileSync(VAT_NOTIFICATIONS_LOG_PATH, 'utf8');
        return new Set(JSON.parse(data));
      }
    } catch (error) {
      console.warn('Error loading VAT notifications log:', error);
    }
    return new Set();
  }

  private saveVatNotificationSent(email: string): void {
    try {
      const vatNotificationsSent = this.loadVatNotificationsSent();
      vatNotificationsSent.add(email);
      fs.writeFileSync(
        VAT_NOTIFICATIONS_LOG_PATH,
        JSON.stringify([...vatNotificationsSent])
      );
    } catch (error) {
      console.error('Error saving VAT notification log:', error);
    }
  }

  async sendVatNotificationEmail(
    email: string,
    currency: string,
    name: string
  ): Promise<void> {
    const vatNotificationsSent = this.loadVatNotificationsSent();
    if (vatNotificationsSent.has(email)) {
      console.log(`Skipping ${email} - VAT notification already sent`);
      return;
    }

    const amount = currency === 'eur' ? '€2' : '$2';
    const markup = VAT_NOTIFICATION_TEMPLATE.replace(
      '{{amount}}',
      amount
    ).replace('{{name}}', name || 'there');

    // Convert HTML to text using cheerio
    const $ = cheerio.load(markup);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    const msg = {
      to: email,
      from: this.defaultSender,
      subject: '2anki.net - Upcoming Changes to VAT',
      text,
      html: markup,
      replyTo: 'support@2anki.net',
    };

    try {
      await sgMail.send(msg);
      this.saveVatNotificationSent(email);
      console.log(`Successfully sent VAT notification to ${email}`);
    } catch (error) {
      console.error(`Failed to send VAT notification to ${email}:`, error);
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

  sendVatNotificationEmail(
    email: string,
    currency: string,
    name: string
  ): Promise<void> {
    console.info('sendVatNotificationEmail not handled', email, currency, name);
    return Promise.resolve();
  }
}

export const useDefaultEmailService = () => {
  if (process.env.SENDGRID_API_KEY !== undefined) {
    return new EmailService(process.env.SENDGRID_API_KEY!, DEFAULT_SENDER);
  }
  return new UnimplementedEmailService();
};
