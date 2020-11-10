const path = require('path')
const fs = require('fs')
import assert from 'assert'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {ZipHandler} from '../src/server/files/zip'

export def test_multiple_images
	console.log 'test multiple images in toggle list'	
	const n = 'Export-e28339bf-3a17-4e09-9d2d-a3c649a33873.zip'
	const payload = fs.readFileSync(path.join(__dirname, 'fixtures', n))
	const zip_handler = ZipHandler.new()
	const _ = await zip_handler.build(payload)
	let deck
	for file_name in zip_handler.filenames()
		console.log('found', file_name)
		if file_name.match(/.(md|html)$/)
			deck = await PrepareDeck(file_name, zip_handler.files, {})
			assert.strictEqual(deck.deck.image_count, 6)
	console.log('✅ test multiple image')
