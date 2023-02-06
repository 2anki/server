import getEmailFromOwner from '../../../User/getEmailFromOwner';
import EmailHandler from '../../../email/EmailHandler';
import ParserRules from '../../../parser/ParserRules';
import { Knex } from 'knex';

interface JobInfo {
  owner: string;
  rules: ParserRules;
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
  db,
  size,
  key,
  apkg,
}: JobInfo) => {
  console.debug('rules.email', rules.EMAIL_NOTIFICATION);
  const email = await getEmailFromOwner(db, owner);
  if (size > 24) {
    const link = `${process.env.DOMAIN}/download/u/${key}`;
    await EmailHandler.SendConversionLinkEmail(email, id, link);
  } else if (rules.EMAIL_NOTIFICATION) {
    await EmailHandler.SendConversionEmail(email, id, apkg);
  }
};
