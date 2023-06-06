import { Knex } from 'knex';
import Jobs from './public/Jobs';

class RulesRepository {
  private readonly tableName: string;

  constructor(private database: Knex) {
    this.tableName = 'rules';
    this.database = database;
  }

  create(
    id: string,
    owner: string,
    input: { [key: string]: string }
  ): Promise<number[]> {
    return this.database(this.tableName)
      .insert({
        owner,
        object_id: id,
        flashcard_is: input.FLASHCARD,
        deck_is: input.DECK,
        sub_deck_is: input.SUB_DECKS,
        tags_is: input.TAGS,
        email_notification: input.EMAIL_NOTIFICATION,
      })
      .onConflict('object_id')
      .merge();
  }

  getById(id: string): Promise<Jobs> {
    return this.database(this.tableName)
      .where({ object_id: id })
      .returning('*')
      .first();
  }
}

export default RulesRepository;
