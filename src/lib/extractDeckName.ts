export interface ExtractNameInput {
  name: string;
  pageIcon: string | null;
  decksCount: number;
  settings: {
    pageEmoji: string;
  };
}

export function extractName(input: ExtractNameInput): string {
  const { name, pageIcon: pi, decksCount, settings } = input;
  if (!pi) {
    return name;
  }
  if (settings.pageEmoji === 'disable_emoji') {
    return name;
  }

  const cleanName = name.replace(/\n/g, ' ');

  if (!cleanName.includes(pi) && decksCount === 0) {
    if (!cleanName.includes('::') && !cleanName.startsWith(pi)) {
      return settings.pageEmoji === 'first_emoji'
        ? `${pi} ${cleanName}`
        : `${cleanName} ${pi}`;
    } else {
      const names = cleanName.split(/::/);
      const end = names.length - 1;
      const last = names[end];
      names[end] =
        settings.pageEmoji === 'first_emoji'
          ? `${pi} ${last}`
          : `${last} ${pi}`;
      return names.join('::');
    }
  }

  return cleanName;
}
