import CardOption from '../../lib/parser/Settings/CardOption';
import { hasMarkdownFileName } from '../../lib/storage/checks';

export function enableMarkdownForMarkdownUploads(
  fileNames: string[],
  settings: CardOption
): CardOption {
  if (settings.nestedBulletPoints) {
    return settings;
  }

  if (hasMarkdownFileName(fileNames)) {
    (settings as { nestedBulletPoints: boolean }).nestedBulletPoints = true;
  }

  return settings;
}
