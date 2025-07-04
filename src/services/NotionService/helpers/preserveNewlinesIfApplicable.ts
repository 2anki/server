import CardOption from '../../../lib/parser/Settings';

export default function preserveNewlinesIfApplicable(
  text: string | null | undefined,
  settings: CardOption
): string {
  if (!text) {
    return '';
  }

  if (settings.perserveNewLines) {
    return text.replace(/\n/g, '<br />');
  }
  return text;
}
