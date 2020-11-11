#!/usr/bin/env imba

import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {Util} from './util'

export def test_grouped_cloze
	const file_name = 'Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html'
	const info = Util.load_html_file(file_name)
	const parser = new DeckParser(file_name, {cherry: false, cloze: true}, info)
	parser.build!
	console.log('✅ test grouped cloze')