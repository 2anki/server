/**
 * isServerBundle returns true if the filename is a server bundle.
 * The 2anki server can send a zip file with multiple APKG files or one APKG file.
 * @param filename The filename to check.
 * @returns boolean
 */
export const isServerBundle = (filename: string) =>
  filename.startsWith('Your decks') || filename.endsWith('.zip');
