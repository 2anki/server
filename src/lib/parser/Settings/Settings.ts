import { captureException } from '@sentry/node';
import { Knex } from 'knex';
import { getCustomTemplate } from './helpers/getCustomTemplate';
import { parseTemplate } from './helpers/parseTemplate';

import { TemplateFile } from './types';

export class Settings {
  readonly deckName: string | undefined;

  readonly useInput: boolean;

  readonly maxOne: boolean;

  readonly noUnderline: boolean;

  readonly isCherry: boolean;

  readonly isAvocado: boolean;

  readonly isAll: boolean;

  readonly fontSize: string;

  readonly isTextOnlyBack: boolean;

  readonly toggleMode: string;

  readonly isCloze: boolean;

  readonly useTags: boolean;

  readonly basicReversed: boolean;

  readonly reversed: boolean;

  readonly removeMP3Links: boolean;

  readonly clozeModelName: string;

  readonly basicModelName: string;

  readonly inputModelName: string;

  readonly clozeModelId: string;

  readonly basicModelId: string;

  readonly inputModelId: string;

  readonly template: string;

  readonly perserveNewLines: boolean;

  public n2aCloze: TemplateFile | undefined | null;

  public n2aBasic: TemplateFile | undefined | null;

  public n2aInput: TemplateFile | undefined | null;

  readonly useNotionId: boolean;

  readonly addNotionLink: boolean;

  readonly pageEmoji: string;

  parentBlockId: string;

  constructor(input: { [key: string]: string }) {
    this.deckName = input.deckName;
    if (this.deckName && !this.deckName.trim()) {
      this.deckName = undefined;
    }
    this.useInput = input['enable-input'] !== 'false';
    this.maxOne = input['max-one-toggle-per-card'] === 'true';
    this.noUnderline = input['no-underline'] === 'true';
    this.isCherry = input.cherry === 'true';
    this.isAvocado = input.avocado === 'true';
    this.isAll = input.all === 'true';
    this.fontSize = input['font-size'];
    this.isTextOnlyBack = input.paragraph === 'true';
    this.toggleMode = input['toggle-mode'] || 'close_toggle';
    this.isCloze = input.cloze !== 'false';
    this.useTags = input.tags !== 'false';
    this.basicReversed = input['basic-reversed'] !== 'false';
    this.reversed = input.reversed !== 'false';
    this.removeMP3Links = input['remove-mp3-links'] === 'true' || false;
    this.perserveNewLines = input['perserve-newlines'] === 'true' || false;
    this.clozeModelName = input.cloze_model_name || 'n2a-cloze';
    this.basicModelName = input.basic_model_name || 'n2a-basic';
    this.inputModelName = input.input_model_name || 'n2a-input';
    this.clozeModelId = input.cloze_model_id;
    this.basicModelId = input.basic_model_id;
    this.inputModelId = input.input_model_id;
    this.template = input.template;
    this.useNotionId = input['use-notion-id'] === 'true';
    this.addNotionLink = input['add-notion-link'] === 'true';
    this.parentBlockId = input.parentBlockId;
    this.pageEmoji = input['page-emoji'] || 'first_emoji';
    /* Is this really needed? */
    if (this.parentBlockId) {
      this.addNotionLink = true;
    }

    this.retrieveTemplates(input);
  }

  retrieveTemplates(input: { [key: string]: string }) {
    try {
      this.n2aBasic = parseTemplate(input['n2a-basic']);
      this.n2aCloze = parseTemplate(input['n2a-cloze']);
      this.n2aInput = parseTemplate(input['n2a-input']);
    } catch (error) {
      captureException(error);
    }
  }

  static LoadDefaultOptions(): { [key: string]: string } {
    return {
      'add-notion-link': 'true',
      'use-notion-id': 'true',
      all: 'true',
      paragraph: 'false',
      cherry: 'false',
      avocado: 'false',
      tags: 'true',
      cloze: 'true',
      'enable-input': 'false',
      'basic-reversed': 'false',
      reversed: 'false',
      'no-underline': 'false',
      'max-one-toggle-per-card': 'true',
      'perserve-newlines': 'false',
      'page-emoji': 'first-emoji',
    };
  }

  static async LoadFrom(
    DB: Knex,
    owner: string,
    id: string
  ): Promise<Settings> {
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
  }
}
