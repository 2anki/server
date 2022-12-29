import getEmailFromOwner from '../../../User/getEmailFromOwner';
import EmailHandler from '../../../email/EmailHandler';
import ParserRules from '../../../parser/ParserRules';
import ConversionJob from '../ConversionJob';
import { Knex } from 'knex';

interface JobInfo {
  owner: string;
  rules: ParserRules;
  job: ConversionJob;
  db: Knex;
  key: string;
  id: string;
  size: number;
  apkg: Buffer;
}
export const notifyUserIfNecessary = async ({
  id,
  owner,
  rules,
  job,
  db,
  size,
  key,
  apkg,
}: JobInfo) => {
  console.log('rules.email', rules.EMAIL_NOTIFICATION);
  await job.completed();
  const email = await getEmailFromOwner(db, owner);
  if (size > 24) {
    const link = `${process.env.DOMAIN}/download/u/${key}`;
    await EmailHandler.SendConversionLinkEmail(email, id, link);
  } else if (rules.EMAIL_NOTIFICATION) {
    await EmailHandler.SendConversionEmail(email, id, apkg);
  }
};
