import path from 'path';
import fs from 'fs';
import * as os from 'os';

export const EMAIL_TEMPLATES_DIRECTORY = path.join(__dirname, 'templates');

export const PASSWORD_RESET_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'reset.html'),
  'utf8'
);

export const CONVERT_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'convert.html'),
  'utf8'
);

export const CONVERT_LINK_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'convert-link.html'),
  'utf8'
);

export const DEFAULT_SENDER = '2anki.net <info@2anki.net>';

export const VAT_NOTIFICATION_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'vat-notification.html'),
  'utf8'
);

export const VAT_NOTIFICATIONS_LOG_PATH = path.join(
  os.homedir(),
  '.2anki',
  'vat-notifications-sent.json'
);

export const SUBSCRIPTION_CANCELLED_TEMPLATE = fs.readFileSync(
  path.join(EMAIL_TEMPLATES_DIRECTORY, 'subscription-cancelled.html'),
  'utf8'
);

export const SUBSCRIPTION_CANCELLATIONS_LOG_PATH = path.join(
  os.homedir(),
  '.2anki',
  'subscriptions-cancelled-sent.json'
);

export const SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE = fs.readFileSync(
  path.join(
    EMAIL_TEMPLATES_DIRECTORY,
    'subscription-scheduled-cancellation.html'
  ),
  'utf8'
);
