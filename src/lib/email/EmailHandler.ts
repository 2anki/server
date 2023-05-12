import path from 'path';
import fs from 'fs';
import { addDeckNameSuffix, isValidDeckName } from '../anki/format';

const EMAIL_TEMPLATES_DIRECTORY = path.join(__dirname, 'templates');

const PASSWORD_RESET_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'reset.html'),
  'utf8'
);
const CONVERT_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'convert.html'),
  'utf8'
);
const CONVERT_LINK_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'convert-link.html'),
  'utf8'
);
const DEFAULT_SENDER = '2anki.net <info@2anki.net>';
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailHandler {
  static SendResetEmail(email: string, token: string) {
    const link = `${process.env.DOMAIN}/users/r/${token}`.replace('//', '/');
    const markup = PASSWORD_RESET_TEMPLATE.replace('{{link}}', link);
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: 'Reset your 2anki.net password',
      text: `I received your password change request, you can change it here${link}`,
      html: markup,
      replyTo: 'alexander@alemayhu.com',
    };

    return sgMail.send(msg);
  }

  static SendConversionEmail(
    email: string,
    filename: string,
    contents: Buffer
  ) {
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

    return sgMail.send(msg);
  }

  static SendConversionLinkEmail(
    email: string,
    filename: string,
    link: string
  ) {
    const markup = CONVERT_LINK_TEMPLATE.replace(/{{link}}/g, link);
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: `2anki.net - Your «${filename}» deck is ready`,
      text: `Download your deck here: ${link}`,
      html: markup,
      replyTo: 'alexander@alemayhu.com',
    };

    return sgMail.send(msg);
  }
}

export default EmailHandler;
