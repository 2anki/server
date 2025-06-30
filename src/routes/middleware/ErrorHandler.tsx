import express from 'express';
import nodemailer from 'nodemailer';
import { UploadedFile } from '../../lib/storage/types';
import { isLimitError } from '../../lib/misc/isLimitError';
import { isEmptyPayload } from '../../lib/misc/isEmptyPayload';
import { preserveFilesForDebugging } from '../../lib/debug/preserveFilesForDebugging';
import * as cheerio from 'cheerio';

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

async function sendErrorEmail(error: Error, req: express.Request) {
  if (process.env.NODE_ENV !== 'production') return;

  const $ = cheerio.load(error.message);
  const plainTextMessage = $.root().text();
  const subject = `[ERROR] [2anki.net] - ${plainTextMessage}`;

  const message = {
    from: process.env.ERROR_SENDER_EMAIL ?? 'noreply@zoe.2anki.net',
    to: process.env.ERROR_RECEIVER_EMAIL ?? 'alexander@alemayhu.com',
    subject,
    text: `
${error.stack}

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
      preserveFilesForDebugging(req, uploadedFiles, err);
    }

    try {
      await sendErrorEmail(err, req);
    } catch (emailErr) {
      console.error('Failed to send error email:', emailErr);
    }
  } else {
    console.info('User no limit reached');
  }

  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
