import { handleNestedBulletPointsInMarkdown } from './handleNestedBulletPointsInMarkdown';
import CardOption from './Settings';
import CustomExporter from './exporters/CustomExporter';
import Workspace from './WorkSpace';
import os from 'os';

describe('handleNestedBulletPointsInMarkdown', () => {
  beforeAll(() => {
    process.env.WORKSPACE_BASE = os.tmpdir();
  });

  it('embeds images referenced in markdown', () => {
    const workspace = new Workspace(true, 'fs');
    const exporter = new CustomExporter('test', workspace.location);
    const settings = new CardOption({});
    const imageContents = Buffer.from('fake-image-data');

    const contents = [
      '- What is shown here?',
      '    ![image.png](image%201.png)',
    ].join('\n');

    const files = [
      { name: 'image 1.png', contents: imageContents },
    ];

    const decks = handleNestedBulletPointsInMarkdown({
      name: 'test.md',
      contents,
      deckName: 'Test',
      decks: [],
      settings,
      exporter,
      workspace,
      files: files as any,
    });

    const card = decks[0].cards[0];
    expect(card.media.length).toBeGreaterThan(0);
  });
});
