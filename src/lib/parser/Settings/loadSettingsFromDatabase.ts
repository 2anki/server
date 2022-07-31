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
    if (!result) {
      return new Settings(Settings.LoadDefaultOptions());
    }

    const settings = new Settings(result.payload);
    const templates = await DB('templates')
      .where({ owner: owner })
      .returning(['payload'])
      .first();

    if (templates && settings.template === 'custom') {
      settings.n2aBasic = getCustomTemplate('n2a-basic', templates.payload);
      settings.n2aCloze = getCustomTemplate('n2a-cloze', templates.payload);
      settings.n2aInput = getCustomTemplate('n2a-input', templates.payload);

      if (settings.n2aBasic) {
        settings.n2aBasic.name = settings.basicModelName;
      }
      if (settings.n2aCloze) {
        settings.n2aCloze.name = settings.clozeModelName;
      }
      if (settings.n2aInput) {
        settings.n2aInput.name = settings.inputModelName;
      }
    }
    return settings;
  } catch (error: unknown) {
    if (error instanceof Error) {
      captureException(`Failed to load settings from db ${error.toString()}`);
    }
    captureException(error);
  }
  return new Settings(Settings.LoadDefaultOptions());
};
