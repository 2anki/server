export function getSafeFilename(name: string) {
  return name.replace(/\//g, '-');
}
