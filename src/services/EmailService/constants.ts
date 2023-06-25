import path from 'path';
import fs from 'fs';

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
