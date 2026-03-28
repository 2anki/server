import { PrepareDeck } from './PrepareDeck';
import CardOption from '../../../lib/parser/Settings/CardOption';

jest.mock('../../../lib/claude/ClaudeService', () => ({
  generateDeckInfo: jest.fn(),
}));

jest.mock('../../../lib/parser/exporters/CustomExporter', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      configure: jest.fn(),
      save: jest.fn().mockResolvedValue(Buffer.from('fake-apkg')),
    })),
  };
});

jest.mock('../../../lib/anki/getDeckFilename', () => ({
  default: jest.fn((name: string) => `${name}.apkg`),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const { generateDeckInfo } = require('../../../lib/claude/ClaudeService');
const CustomExporterMock = require('../../../lib/parser/exporters/CustomExporter').default;

function makeSettings(overrides: Record<string, string> = {}): CardOption {
  return new CardOption({ ...CardOption.LoadDefaultOptions(), ...overrides });
}

function makeWorkspace() {
  return { location: '/tmp/test-workspace' } as any;
}

describe('PrepareDeck — Claude AI flashcards branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invokes ClaudeService when claudeAIFlashcards is true and user is paying', async () => {
    const deckArray = [
      {
        name: 'My Deck',
        image: '',
        style: null,
        id: 111222333444555,
        settings: { template: 'specialstyle' },
        cards: [
          {
            name: 'Front',
            back: 'Back',
            tags: [],
            cloze: false,
            number: 0,
            enableInput: false,
            answer: '',
            media: [],
          },
        ],
      },
    ];

    generateDeckInfo.mockResolvedValueOnce(deckArray);

    const settings = makeSettings({ 'claude-ai-flashcards': 'true' });
    const result = await PrepareDeck({
      name: 'test.html',
      files: [{ name: 'test.html', contents: '<p>Front</p>' }],
      settings,
      noLimits: true,
      workspace: makeWorkspace(),
    });

    expect(generateDeckInfo).toHaveBeenCalledTimes(1);
    expect(result.name).toContain('My Deck');
    expect(result.apkg).toEqual(Buffer.from('fake-apkg'));
  });

  it('does not invoke ClaudeService when noLimits is false', async () => {
    const settings = makeSettings({ 'claude-ai-flashcards': 'true' });

    jest.mock('../../../lib/parser/DeckParser', () => ({
      DeckParser: jest.fn().mockImplementation(() => ({
        totalCardCount: jest.fn().mockReturnValue(0),
        processFirstFile: jest.fn(),
        tryExperimental: jest.fn().mockResolvedValue(Buffer.from('regular-apkg')),
        name: 'test',
        payload: [],
      })),
    }));

    await PrepareDeck({
      name: 'test.html',
      files: [{ name: 'test.html', contents: '<p>Front</p>' }],
      settings,
      noLimits: false,
      workspace: makeWorkspace(),
    }).catch(() => {});

    expect(generateDeckInfo).not.toHaveBeenCalled();
  });

  it('does not invoke ClaudeService when claudeAIFlashcards is false', async () => {
    const settings = makeSettings({ 'claude-ai-flashcards': 'false' });

    await PrepareDeck({
      name: 'test.html',
      files: [{ name: 'test.html', contents: '<p>Front</p>' }],
      settings,
      noLimits: true,
      workspace: makeWorkspace(),
    }).catch(() => {});

    expect(generateDeckInfo).not.toHaveBeenCalled();
  });
});
