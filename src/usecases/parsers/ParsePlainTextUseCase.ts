import { PlainTextParser } from '../parsers/PlainTextParser';

export class ParsePlainTextUseCase {
  constructor(private readonly parser: PlainTextParser) {}
  execute(text: string) {
    return this.parser.parse(text);
  }
}
