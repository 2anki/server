import { PlainTextParser } from '../../lib/parser/experimental/PlainTextParser/PlainTextParser';

export class ParsePlainTextUseCase {
  constructor(private readonly parser: PlainTextParser) {}

  execute(text: string) {
    return this.parser.parse(text);
  }
}
