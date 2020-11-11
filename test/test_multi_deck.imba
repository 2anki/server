#!/usr/bin/env imba

import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {Util} from './util'

export def test_multi_deck()
	const file_name = 'Nested Toggles.html'
	const info = Util.load_html_file(file_name)
	const parser = new DeckParser(file_name, {cherry: true}, info)
	console.log('✅ test multi deck')