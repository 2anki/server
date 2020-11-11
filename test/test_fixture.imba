import assert from 'assert'

const path = require('path')
const fs = require('fs')

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'

import {Util} from './util'

export def test_fixture
	# test_fixture('with-image.html', 'HTML test', 3, {'HTML%20test%20202b0d67c0584bc6b1ce9e35b753128b/Skjermbilde_2020-05-13_kl._19.45.08.png': 'empty'})
	const f = 'no-images.html'
	const i = Util.load_html_file(f)
	const deck_name = 'HTML test'
	const card_count = 2
	const files = {}

	try
		const isMarkdown = i["{f}"].match(/.(md|html)$/)
		const deck = new DeckParser(i.file_name, {}, i)		
		const payload = deck.payload[0]

		assert.strictEqual(payload.style != undefined, true)
		assert.strictEqual(payload.name, deck_name)
		assert.strictEqual(payload.cards.length, card_count)

		# TODO: check persisted files exist (relative)
		# if card_count > 0
		# 	const zip_file_path = path.join(__dirname, "fixtures", "{payload.name}.apkg")
		# 	await deck.build!
		# 	console.log('hjå')
		# 	assert.strictEqual(fs.existsSync(zip_file_path), true)
		return deck
	catch e
		console.error(e)
		process.exit(1)