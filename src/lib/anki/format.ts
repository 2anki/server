export const DECK_NAME_SUFFIX = 'apkg';
export const AUDIO_FILE_SUFFIX = 'mp3';

export const isValidDeckName = (filename: string) =>
  filename.endsWith(`.${DECK_NAME_SUFFIX}`);

export const addDeckNameSuffix = (filename: string) =>
  `${filename}.${DECK_NAME_SUFFIX}`;

export const isValidAudioFile = (filename: string) =>
  filename.endsWith(`.${AUDIO_FILE_SUFFIX}`);
