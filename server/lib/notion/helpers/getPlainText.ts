interface Text {
  plain_text: string;
}

export default function getPlainText(text: Text[]): string {
  if (text.length === 0) {
    return '';
  }
  return text.map((t) => t.plain_text).reduce((acc, curr) => `${acc}<br>${curr}`);
}
