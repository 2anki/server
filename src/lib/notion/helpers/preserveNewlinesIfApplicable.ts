import Settings from '../../parser/Settings';

export default function preserveNewlinesIfApplicable(
  text: string,
  settings: Settings
): string {
  if (settings.perserveNewLines) {
    return text.replace(/\n/g, '<br />');
  }
  return text;
}
