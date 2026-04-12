import CardOption from '../../lib/parser/Settings/CardOption';
import { hasMarkdownFileName } from '../../lib/storage/checks';

export function enableMarkdownForMarkdownUploads(
  fileNames: string[],
  settings: CardOption
): CardOption {
  if (settings.nestedBulletPoints) {
    return settings;
  }

  if (!hasMarkdownFileName(fileNames)) {
    return settings;
  }

  const copy = Object.create(
    Object.getPrototypeOf(settings),
    Object.getOwnPropertyDescriptors(settings)
  );
  copy.nestedBulletPoints = true;
  return copy;
}
