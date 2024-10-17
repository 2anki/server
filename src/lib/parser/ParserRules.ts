import { getDatabase } from '../../data_layer';
import addHeadings from './helpers/addHeadings';

class ParserRules {
  private FLASHCARD = ['toggle'];

  DECK = ['page', 'database'];

  SUB_DECKS = ['child_page'];

  TAGS = 'strikethrough';

  UNLIMITED = false;

  EMAIL_NOTIFICATION = false;

  /**
   *  Function to handle transforming flaschard types to proper names for use in traversal
   * @returns all type names for flashcards
   */
  flaschardTypeNames(): string[] {
    let names = this.FLASHCARD;
    names = addHeadings(names);
    return names;
  }

  /**
   * Setter for the types to prevent direct access
   * @param types string[]
   */
  setFlashcardTypes(types: string[]) {
    this.FLASHCARD = types;
  }

  /**
   *  return the flashcard types
   * @returns string[]
   */
  flashcardTypes(): string[] {
    return this.FLASHCARD;
  }

  static async Load(owner: string, id: string): Promise<ParserRules> {
    try {
      const rules = new ParserRules();
      const result = await getDatabase()('parser_rules')
        .where({ object_id: id, owner })
        .returning(['*'])
        .first();
      rules.setFlashcardTypes(result.flashcard_is.split(','));
      rules.DECK = result.deck_is;
      rules.SUB_DECKS = result.sub_deck_is;
      rules.TAGS = result.tags_is;
      rules.EMAIL_NOTIFICATION = result.email_notification;
      return rules;
    } catch (error) {
      console.error(error);
      return new ParserRules();
    }
  }

  useColums() {
    return this.FLASHCARD.includes('column_list');
  }

  permitsDeckAsPage(): boolean {
    return this.DECK.includes('page');
  }
}

export default ParserRules;
