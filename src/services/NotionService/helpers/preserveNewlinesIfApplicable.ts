import CardOption from '../../../lib/parser/Settings';

export default function preserveNewlinesIfApplicable(
  text: string,
  settings: CardOption
): string {
  if (settings.perserveNewLines) {
    return text.replace(/\n/g, '<br />');
  }
  return text;
}
