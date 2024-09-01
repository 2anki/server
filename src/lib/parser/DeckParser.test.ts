import { setupTests } from '../../test/configure-jest';
import { getFirstDeckFromPayload } from '../../test/test-utils';
import Settings from './Settings/';

beforeEach(() => setupTests());

test('Toggle Headings', async () => {
  const deck = await getFirstDeckFromPayload(
    'Toggle Hea 0e02b 2.html',
    new Settings({ cherry: 'false' })
  );
  expect(deck.cards.length).toBeGreaterThan(0);
});

test('Grouped cloze deletions', async () => {
  const deck = await getFirstDeckFromPayload(
    'Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html',
    new Settings({ cherry: 'false', cloze: 'true', reversed: 'true', 'basic-reversed': 'true' })
  );
  expect(deck.name).toBe('Grouped Cloze Deletions');
  expect(deck.cards.length).toBe(20);
});

test('Cloze Deletions', async () => {
  const deck = await getFirstDeckFromPayload(
    'Some Cloze Deletions 1a118169ada841a99a9aaccc7eaa6775.html',
    new Settings({ cherry: 'false', reversed: 'true', 'basic-reversed': 'true' })
  );
  expect(deck.cards[0].back).toBe(
    "<div class='toggle'>{{c2::Canberra}} was founded in {{c1::1913}}.</div>"
  );
  expect(deck.cards[1].back).toBe(
    "<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913::year}}</div>"
  );
  expect(deck.cards[2].back).toBe(
    "<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913}}</div>"
  );
  expect(deck.cards[3].back).toBe(
    "<div class='toggle'>{{c1::This}} is a {{c2::cloze deletion}}</div>"
  );
  expect(deck.cards[4].back).toBe(
    "<div class='toggle'>{{c2::Canberra}} was founded in {{c1::1913}}.</div>"
  );
  expect(deck.cards[5].back).toEqual(
    "<div class='toggle'>{{c1::Canberra::city}} was founded in {{c2::1913::year}}</div>"
  );
});

test('Colours', async () => {
  const deck = await getFirstDeckFromPayload(
    'Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html',
    new Settings({ cherry: 'false' })
  );
  expect(deck.cards[0].back.includes('block-color')).toBe(true);
});

test.skip('HTML Regression Test', (t) => {
  t.fail(
    'please automate HTML regression check. Use this page https://www.notion.so/HTML-test-4aa53621a84a4660b69e9953f3938685.'
  );
});

test('Nested Toggles', async () => {
  const deck = await getFirstDeckFromPayload(
    'Nested Toggles.html',
    new Settings({ cherry: 'true', reversed: 'true', 'basic-reversed': 'true' })
  );
  expect(deck.cards.length).toBe(12);
});

test('Global Tags', async () => {
  const deck = await getFirstDeckFromPayload(
    'Global Tag Support.html',
    new Settings({ tags: 'true', cherry: 'false' })
  );
  // use toContain
  expect(deck.cards[0].tags.includes('global')).toBe(true);
});

test.todo('Input Cards ');
test.todo('Multiple File Uploads');
test.todo('Test Basic Card');

test('Markdown empty deck', async () => {
  const deck = await getFirstDeckFromPayload('empty-deck.md', new Settings({
    "markdown-nested-bullet-points": "true"
  }));
  expect(deck.name).toBe('Empty Deck');
  expect(deck.cards.length).toBe(0);
})

test('Markdown nested bullet points', async () => {
  const deck = await getFirstDeckFromPayload('simple-deck.md', new Settings({
    "markdown-nested-bullet-points": "true",
    "reversed": "false",
    "basic-reversed": "false",
  }));
  expect(deck.name).toBe('Simple deck');
  expect(deck.cards[0].name).toBe('<ul>\n<li>' + 'What is the capital of Kenya?' + '</li>\n</ul>');
  expect(deck.cards[0].back).toBe('<pre><code>Nairobi</code></pre>');
  expect(deck.cards[1].name).toBe('<ul>\n<li>' + 'What is the capital of Norway' + '</li>\n</ul>');
  expect(deck.cards[1].back).toBe('<pre><code>Oslo</code></pre>');
  expect(deck.cards[2].name).toBe('<ul>\n<li>' + 'What is the capital of Sweden'+'</li>\n</ul>');
  expect(deck.cards[2].back).toBe('<pre><code>Stockholm</code></pre>');
  expect(deck.cards.length).toBe(3);
})
