#!/usr/bin/env imba

import assert from 'assert'
import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'

export def test_colours()
	const file_name = 'Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html'
	const file_path = path.join(__dirname, "fixtures", file_name)
	const html = fs.readFileSync(file_path).toString!
	const info = {}

	info[file_name] = html
	const parser = new DeckParser(file_name, {cherry: false}, info)
	const cards = parser.payload[0].cards

	const expected = /block-color-/.test(cards[0].name)
	const actual = true
	assert.strictEqual(expected, actual)
	console.log('✅ test colours')