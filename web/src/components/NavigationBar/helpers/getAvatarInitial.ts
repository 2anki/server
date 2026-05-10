export function getAvatarInitial(email: string | null | undefined): string {
  if (email == null) return '?';
  const trimmed = email.trim();
  if (trimmed.length === 0) return '?';
  const localPart = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  const firstChar = localPart.trim().charAt(0);
  if (firstChar.length === 0) return '?';
  return firstChar.toUpperCase();
}
