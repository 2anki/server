import SettingsService, {
  IServiceSettings,
} from '../../services/SettingsService';
import SettingsController from './SettingsController';
import { SettingsInitializer } from '../../data_layer/public/Settings';

class FakeSettingsService implements IServiceSettings {
  create(settings: SettingsInitializer): Promise<number[]> {
    return Promise.resolve([]);
  }
  delete(owner: string, id: string): Promise<void> {
    return Promise.resolve();
  }

  getById(id: string): Promise<SettingsInitializer> {
    return Promise.resolve({
      object_id: '1',
      owner: '1',
      payload: 'payload',
    });
  }
}

function testDefaultSettings(
  type: 'client' | 'server',
  expectedOptions: Record<string, string>
) {
  const settingsController = new SettingsController(new FakeSettingsService());
  const defaultOptions = settingsController.getDefaultSettingsCardOptions(type);
  expect(defaultOptions).toStrictEqual(expectedOptions);
}

describe('SettingsController', () => {
  test('returns default settings for client', () => {
    testDefaultSettings('client', {
      'add-notion-link': 'false',
      'use-notion-id': 'true',
      all: 'true',
      paragraph: 'false',
      cherry: 'false',
      avocado: 'false',
      tags: 'false',
      cloze: 'true',
      'markdown-nested-bullet-points': 'false',
      'enable-input': 'false',
      'basic-reversed': 'false',
      reversed: 'false',
      'no-underline': 'false',
      'max-one-toggle-per-card': 'true',
      'remove-mp3-links': 'true',
      'perserve-newlines': 'true',
      'vertex-ai-pdf-questions': 'false',
      'disable-indented-bullets': 'false',
      'image-quiz-html-to-anki': 'false',
    });
  });

  test('returns default settings for server', () => {
    testDefaultSettings('server', {
      'add-notion-link': 'false',
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
      'image-quiz-html-to-anki': 'false',
    });
  });
});
