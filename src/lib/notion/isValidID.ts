export function isValidID(id: string | undefined | null) {
  if (!id) {
    return false;
  }
  return id.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
  );
}
