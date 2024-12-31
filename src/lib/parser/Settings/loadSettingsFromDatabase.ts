import { Knex } from 'knex';

import { getCustomTemplate } from './helpers/getCustomTemplate';
import CardOption from './CardOption';

export const loadSettingsFromDatabase = async (
  DB: Knex,
  owner: string,
  id: string
): Promise<CardOption> => {
  try {
    const result = await DB('settings')
      .where({ object_id: id, owner })
      .returning(['payload'])
      .first();
    if (!result) {
      console.log('using default settings');
      return new CardOption(CardOption.LoadDefaultOptions());
    }

    const settings = new CardOption(result.payload.payload);
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
    console.info('Load settings from database failed');
    console.error(error);
  }
  return new CardOption(CardOption.LoadDefaultOptions());
};
