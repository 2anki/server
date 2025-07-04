import JobRepository from '../../data_layer/JobRepository';
import ParserRules from '../../lib/parser/ParserRules';
import { Knex } from 'knex';
import getEmailFromOwner from '../../lib/User/getEmailFromOwner';
import { useDefaultEmailService } from '../../services/EmailService/EmailService';

export interface NotifyUserUseCaseInput {
  owner: string;
  rules: ParserRules;
  db: Knex;
  key: string;
  id: string;
  size: number;
  apkg: Buffer;
}

export class NotifyUserUseCase {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(input: NotifyUserUseCaseInput): Promise<void> {
    const { owner, rules, db, key, id, size, apkg } = input;

    console.debug('rules.email', rules.EMAIL_NOTIFICATION);
    // TODO: use UserRepository to get user email
    const email = await getEmailFromOwner(db, owner);
    const emailService = useDefaultEmailService();

    // Notify for files bigger than 24MB or if email notifications are not enabled
    if (size > 24) {
      const link = `${process.env.DOMAIN}/api/download/u/${key}`;
      await emailService.sendConversionLinkEmail(email, id, link);
    }
    // Always notify if email notifications are enabled
    else if (rules.EMAIL_NOTIFICATION) {
      await emailService.sendConversionEmail(email, id, apkg);
    }
  }
}
