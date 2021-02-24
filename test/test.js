const path = require('path');
const fs = require('fs');

const test = require('ava');

const {DeckParser, PrepareDeck} = require('../server/parser/deck')

function mockPayload(fileName, html) {
        const struct = { file_name: fileName };
        struct[fileName] = html;
        return struct;
}

function loadHTMLStructre(fileName) {
        const filePath = path.join(__dirname, "fixtures", fileName);
        const html = fs.readFileSync(filePath).toString();
        return mockPayload(fileName, html);
}

function configureParser(fileName, opts) {
        const info = loadHTMLStructre(fileName);
        return  new DeckParser(fileName, opts, info);
}

async function getDeck(fileName, opts) {
        const p = configureParser(fileName, opts);
        await p.build(); 
        return p.payload[0];
}

test('Grouped cloze deletions', async (t) => {
        const deck = await getDeck('Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html', {cherry: 'false', cloze: 'true'})
        t.true(deck.name == 'Grouped Cloze Deletions')
        t.true(deck.card_count == 10)
})

test('Colours', async(t) => {
        const deck = await getDeck('Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html', {cherry: 'false'})
        t.true(deck.cards[0].back.includes('block-color'))
})

test.skip('HTML Regression Test', t => {
        console.log("#TODO: please automate HTML regression check. Use this page https://www.notion.so/HTML-test-4aa53621a84a4660b69e9953f3938685.")
        t.fail('to be implemented')
})