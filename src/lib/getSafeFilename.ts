export function getSafeFilename(name: string) {
  return name.replace(/[/\\\0]/g, '-');
}
