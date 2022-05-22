export default class TagRegistry {
  headings: string[];

  strikethroughs: string[];

  // singleton instance
  private static _instance: TagRegistry;

  constructor() {
    this.strikethroughs = [];
    this.headings = [];
  }

  static getInstance(): TagRegistry {
    if (!TagRegistry._instance) {
      TagRegistry._instance = new TagRegistry();
    }
    return TagRegistry._instance;
  }

  addHeading(heading: string): void {
    this.headings.push(heading);
  }

  addStrikethrough(strikethrough: string): void {
    this.strikethroughs.push(strikethrough);
  }

  clear(): void {
    this.headings = [];
    this.strikethroughs = [];
  }
}
