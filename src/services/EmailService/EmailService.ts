import * as sgMail from '@sendgrid/mail';
import {
  CONVERT_LINK_TEMPLATE,
  CONVERT_TEMPLATE,
  DEFAULT_SENDER,
  PASSWORD_RESET_TEMPLATE,
} from './constants';
import { isValidDeckName, addDeckNameSuffix } from '../../lib/anki/format';

export interface IEmailService {
  sendResetEmail(email: string, token: string): void;
  sendConversionEmail(email: string, filename: string, contents: Buffer): void;
  sendConversionLinkEmail(email: string, filename: string, link: string): void;
}

class EmailService implements IEmailService {
  constructor(apiKey: string, readonly defaultSender: string) {
    sgMail.setApiKey(apiKey);
  }

  sendResetEmail(email: string, token: string) {
    const link = `${process.env.DOMAIN}/users/r/${token}`.replace('//', '/');
    const markup = PASSWORD_RESET_TEMPLATE.replace('{{link}}', link);
    const msg = {
      to: email,
      from: this.defaultSender,
      subject: 'Reset your 2anki.net password',
      text: `I received your password change request, you can change it here${link}`,
      html: markup,
      replyTo: 'alexander@alemayhu.com',
    };

    sgMail.send(msg);
  }

  async sendConversionEmail(email: string, filename: string, contents: Buffer) {
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
      replyTo: 'alexander@alemayhu.com',
      attachments: [
        {
          content: contents.toString('base64'),
          filename: attachedFilename,
          type: 'application/apkg',
          disposition: 'attachment',
        },
      ],
    };

    sgMail.send(msg);
  }

  async sendConversionLinkEmail(email: string, filename: string, link: string) {
    const markup = CONVERT_LINK_TEMPLATE.replace(/{{link}}/g, link);
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: `2anki.net - Your «${filename}» deck is ready`,
      text: `Download your deck here: ${link}`,
      html: markup,
      replyTo: 'alexander@alemayhu.com',
    };

    await sgMail.send(msg);
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
}

export const useDefaultEmailService = () => {
  if (process.env.SENDGRID_API_KEY !== undefined) {
    return new EmailService(process.env.SENDGRID_API_KEY!, DEFAULT_SENDER);
  }
  return new UnimplementedEmailService();
};
