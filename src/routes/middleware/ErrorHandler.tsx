import express from 'express';
import nodemailer from 'nodemailer';
import { UploadedFile } from '../../lib/storage/types';
import { isLimitError } from '../../lib/misc/isLimitError';
import { isEmptyPayload } from '../../lib/misc/isEmptyPayload';
import { perserveFilesForDebugging } from '../../lib/debug/perserveFilesForDebugging';

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

async function sendErrorEmail(error: Error, req: express.Request) {
  if (process.env.NODE_ENV !== 'production') return;

  const message = {
    from: process.env.ERROR_SENDER_EMAIL || 'noreply@zoe.2anki.net',
    to: process.env.ERROR_RECEIVER_EMAIL || 'alexander@alemayhu.com',
    subject: `[ERROR] [2anki.net] ${error.name}: ${error.message}`,
    text: `
Error: ${error.stack}

Request path: ${req.path}
Method: ${req.method}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body)}
`,
  };

  try {
    await transporter.sendMail(message);
  } catch (emailErr) {
    console.error('Failed to send error email:', emailErr);
  }
}

export default async function ErrorHandler(
  res: express.Response,
  req: express.Request,
  err: Error
) {
  const uploadedFiles = req.files as UploadedFile[];
  const skipError = isLimitError(err);

  if (!skipError) {
    console.info('Send error');
    console.error(err);
    if (!isEmptyPayload(uploadedFiles)) {
      perserveFilesForDebugging(uploadedFiles, err);
    }
    await sendErrorEmail(err, req);
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
