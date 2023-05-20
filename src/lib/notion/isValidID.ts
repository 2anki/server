export function isValidID(id: string | undefined | null) {
  if (!id) {
    return false;
  }

  const regex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  return regex.exec(id);
}
