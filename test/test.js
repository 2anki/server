const path = require('path')
const fs = require('fs')

const test = require('ava')

const { DeckParser } = require('../server/parser/deck')
const { ToggleList } = require('../server/parser/ToggleList')
const { Tags } = require('../server/parser/Tags')

function mockPayload (fileName, html) {
  const struct = { file_name: fileName }
  struct[fileName] = html
  return struct
}

function loadHTMLStructre (fileName) {
  const filePath = path.join(__dirname, 'fixtures', fileName)
  const html = fs.readFileSync(filePath).toString()
  return mockPayload(fileName, html)
}

function configureParser (fileName, opts) {
  const info = loadHTMLStructre(fileName)
  return new DeckParser(fileName, opts, info)
}

async function getDeck (fileName, opts) {
  const p = configureParser(fileName, opts)
  await p.build()
  return p.payload[0]
}

test('Grouped cloze deletions', async (t) => {
  const deck = await getDeck('Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html', { cherry: 'false', cloze: 'true' })
  t.true(deck.name === 'Grouped Cloze Deletions')
  t.true(deck.cardCount === 10)
})

test('Colours', async (t) => {
  const deck = await getDeck('Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html', { cherry: 'false' })
  t.true(deck.cards[0].back.includes('block-color'))
})

test.skip('HTML Regression Test', t => {
  console.log('#TODO: please automate HTML regression check. Use this page https://www.notion.so/HTML-test-4aa53621a84a4660b69e9953f3938685.')
  t.fail('to be implemented')
})

test('Nested Toggles', async (t) => {
  const deck = await getDeck('Nested Toggles.html', { cherry: 'true' })
  t.true(deck.cardCount === 6)
})

test('Global Tags', async (t) => {
  const deck = await getDeck('Global Tag Support.html', { tags: 'true', cherry: 'false' })
  t.true(deck.cards[0].tags.includes('global'))
})

test('Test Basic Card', async (t) => {
  const input = fs.readFileSync(path.join(__dirname, './fixtures/partial-basic-toggle.html')).toString()
  const toggle = new ToggleList(input)
  const tags = new Tags(toggle)
  toggle.use(tags)
  t.deepEqual(toggle.front, '<div class=\'toggle\'>What is the capital in Albania?</div>')
  // TODO: fix bug where the tag leaves residue (left in here for  backwards compatability)
  t.deepEqual(toggle.back, '<p id="39c99ed4-9c63-4400-a6a2-a1924843b282" class>Tirana!</p><p id="b45884ba-e24c-4c4d-a8b7-a7d5dc8a97a7" class></p>')
  t.deepEqual(toggle.tags, ['basic'])
})

test.skip('Input Cards ', t => {
  t.fail('to be implemented')
})
