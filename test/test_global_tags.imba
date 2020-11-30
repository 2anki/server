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
	const payload = deck.payload[0]
	console.log('✅ test global tags')

if process.main != module
	test_global_tags!