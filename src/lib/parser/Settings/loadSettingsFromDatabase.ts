import { captureException } from '@sentry/node';
import { Knex } from 'knex';

import { getCustomTemplate } from './helpers/getCustomTemplate';
import { Settings } from './Settings';

export const loadSettingsFromDatabase = async (
  DB: Knex,
  owner: string,
  id: string
): Promise<Settings> => {
  try {
    const result = await DB('settings')
      .where({ object_id: id, owner })
      .returning(['payload'])
      .first();

    const templates = await DB('templates')
      .where({ owner: owner })
      .returning(['payload'])
      .first();
    if (result) {
      const settings = new Settings(result.payload);
      if (templates && settings.template === 'custom') {
        settings.n2aBasic = getCustomTemplate('n2a-basic', templates.payload);
        settings.n2aCloze = getCustomTemplate('n2a-cloze', templates.payload);
        settings.n2aInput = getCustomTemplate('n2a-input', templates.payload);
      }
      return settings;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      captureException(`Failed to load settings from db ${error.toString()}`);
    }
    captureException(error);
  }
  return new Settings(Settings.LoadDefaultOptions());
};
