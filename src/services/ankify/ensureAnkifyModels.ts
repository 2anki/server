import { AnkiConnectClient } from './AnkiConnectClient';
import {
  ANKIFY_BASIC_MODEL,
  ANKIFY_CLOZE_MODEL,
  ankifyBasicCreateModelParams,
  ankifyClozeCreateModelParams,
} from './ankifyModels';

const ALREADY_EXISTS_PATTERN = /already\s+exists/i;

const isAlreadyExistsError = (error: unknown): boolean =>
  error instanceof Error && ALREADY_EXISTS_PATTERN.test(error.message);

const ensureSingleModel = async (
  ac: AnkiConnectClient,
  cache: Set<string>,
  params: ReturnType<typeof ankifyBasicCreateModelParams>
): Promise<void> => {
  if (cache.has(params.modelName)) {
    return;
  }
  try {
    await ac.createModel(params);
  } catch (error) {
    if (!isAlreadyExistsError(error)) {
      throw error;
    }
  }
  cache.add(params.modelName);
};

export const ensureAnkifyModels = async (
  ac: AnkiConnectClient,
  cache: Set<string>
): Promise<void> => {
  if (cache.has(ANKIFY_BASIC_MODEL) && cache.has(ANKIFY_CLOZE_MODEL)) {
    return;
  }

  const existing = new Set(await ac.modelNames());
  for (const name of existing) {
    if (name === ANKIFY_BASIC_MODEL || name === ANKIFY_CLOZE_MODEL) {
      cache.add(name);
    }
  }

  await ensureSingleModel(ac, cache, ankifyBasicCreateModelParams());
  await ensureSingleModel(ac, cache, ankifyClozeCreateModelParams());
};
