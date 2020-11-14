#!/usr/bin/env imba

import assert from 'assert'

import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {Util} from './util'

export def test_global_tags()
	const file_name = 'Global Tag Support.html'
	const info = Util.load_html_file(file_name)
	const deck = new DeckParser(info.file_name, {}, info)
	// deck.build!		
	const payload = deck.payload[0]
	# assert.strictEqual(payload.tags != undefined, true)
	# assert.strictEqual(payload.tags.includes('tag'), true)
	console.log('✅ test global tags')
	# yarn run imba test/test_global_tags.imba
	###
	1. Create Notion page that includes at least one global 'tag', preferably more
	1.1 Add the export to Global Tag Support.html (only the HTML, not zip)
	1.2 Write the code
	2. Run test again
	3. Success!
	###

if process.main != module
	test_global_tags!