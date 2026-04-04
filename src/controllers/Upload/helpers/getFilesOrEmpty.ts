export function getFilesOrEmpty<T>(body: Record<string, string>): T[] {
  if (body === undefined || body === null) {
    return [];
  }
  return body.files ? JSON.parse(body.files) : [];
}
