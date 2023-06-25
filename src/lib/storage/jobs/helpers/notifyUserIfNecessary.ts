import { useDefaultEmailService } from '../../../../services/EmailService/EmailService';
import getEmailFromOwner from '../../../User/getEmailFromOwner';
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
  const emailService = useDefaultEmailService();

  if (size > 24) {
    const link = `${process.env.DOMAIN}/api/download/u/${key}`;
    await emailService.sendConversionLinkEmail(email, id, link);
  } else if (rules.EMAIL_NOTIFICATION) {
    await emailService.sendConversionEmail(email, id, apkg);
  }
};
