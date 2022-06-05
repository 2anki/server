export default class Note {
  name: string;

  back: string;

  tags: string[];

  cloze = false;

  number = 0;

  enableInput = false;

  answer = '';

  media: string[] = [];

  notionId?: string;

  notionLink?: string;

  constructor(name: string, back: string) {
    this.name = name;
    this.back = back;
    this.tags = [];
  }

  hasCherry() {
    const cherry = '&#x1F352;';
    return (
      (this.name && (this.name.includes(cherry) || this.name.includes('🍒'))) ||
      (this.back && (this.back.includes(cherry) || this.back.includes('🍒')))
    );
  }

  hasAvocado() {
    const avocado = '&#x1F951';
    return (
      (this.name &&
        (this.name.includes(avocado) || this.name.includes('🥑'))) ||
      (this.back && (this.back.includes(avocado) || this.back.includes('🥑')))
    );
  }

  copyValues(clozeCard: Note) {
    this.name = clozeCard.name;
    this.back = clozeCard.back;
    this.tags = clozeCard.tags;
    this.cloze = clozeCard.cloze;
    this.number = clozeCard.number;
    this.enableInput = clozeCard.enableInput;
    this.answer = clozeCard.answer;
    this.media = clozeCard.media;
    this.notionId = clozeCard.notionId;
    this.notionLink = clozeCard.notionLink;
  }

  /**
   * Check if flashcard is not empty
   * @returns boolean
   */
  isValid(): boolean {
    // All flaschards require a front side
    if (!this.name) {
      return false;
    }

    // Cloze and input cards can have an empty back
    if (
      (this.cloze || this.enableInput) &&
      this.name.includes('{{') &&
      this.name.includes('}}')
    ) {
      return true;
    }

    // Basic flashcards must have a back to be valid
    if (this.back) {
      return true;
    }

    return false;
  }

  hasRefreshIcon() {
    return this.name.includes('&#x1F504') || this.name.includes('🔄');
  }

  reversed(input: Note): Note {
    const note = new Note(input.back, input.name);
    note.tags = input.tags;
    note.media = input.media;
    // Due to backwards compatability, do not increment number here
    note.number = -1;
    return note;
  }
}
