#!/usr/bin/env imba

import assert from 'assert'
import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {Util} from './util'

export def test_colours
	const i = Util.load_html_file('Colours 0519bf7e86d84ee4ba710c1b7ff7438e.html')
	const parser = new DeckParser(i.file_name, {cherry: false}, i)
	const cards = parser.payload[0].cards

	const expected = /block-color-/.test(cards[0].name)
	const actual = true
	assert.strictEqual(expected, actual)
	console.log('✅ test colours')