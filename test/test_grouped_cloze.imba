#!/usr/bin/env imba

import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'

export def test_grouped_cloze
	const file_name = 'Grouped Cloze Deletions fbf856ad7911423dbef0bfd3e3c5ce5c 3.html'
	const file_path = path.join(__dirname, "fixtures", file_name)
	const html = fs.readFileSync(file_path).toString!
	const info = {}

	console.log('read', file_path.replace(/\s/, '\\ '))
	console.log('length', html.length)
	info[file_name] = html
	const parser = new DeckParser(file_name, {cherry: false, cloze: true}, info)
	parser.build!
	console.log('✅ test grouped cloze')