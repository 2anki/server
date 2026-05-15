export function slugifyTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const slug = trimmed
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : null;
}
