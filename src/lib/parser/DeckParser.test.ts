import { setupTests } from '../../test/configure-jest';
import { getDeck } from '../../test/test-utils';
import Settings from './Settings/';

beforeEach(() => setupTests());

test.skip('Toggle Headings', async () => {
  const deck = await getDeck(
    'Toggle Hea 0e02b 2.html',
    new Settings({ cherry: 'false' })
  );
  expect(deck.cards.length).toBeGreaterThan(0);
});

test('Grouped cloze deletions', async () => {
  const deck = await getDeck(
    'Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html',
    new Settings({ cherry: 'false', cloze: 'true' })
  );
  expect(deck.name).toBe('Grouped Cloze Deletions');
  expect(deck.cards.length).toBe(20);
});

test('Cloze Deletions', async () => {
  const deck = await getDeck(
    'Some Cloze Deletions 1a118169ada841a99a9aaccc7eaa6775.html',
    new Settings({ cherry: 'false' })
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
  const deck = await getDeck(
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
  const deck = await getDeck(
    'Nested Toggles.html',
    new Settings({ cherry: 'true' })
  );
  expect(deck.cards.length).toBe(12);
});

test('Global Tags', async () => {
  const deck = await getDeck(
    'Global Tag Support.html',
    new Settings({ tags: 'true', cherry: 'false' })
  );
  // use toContain
  expect(deck.cards[0].tags.includes('global')).toBe(true);
});

test.todo('Input Cards ');
test.todo('Multiple File Uploads');
test.todo('Test Basic Card');
