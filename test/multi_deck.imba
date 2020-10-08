#!/usr/bin/env imba

import path from 'path'
import fs from 'fs'

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'

def main(file_name)
	const file_path = path.join(__dirname, "fixtures", file_name)
	const html = fs.readFileSync(file_path).toString!
	const info = {}


	console.log('read', file_path.replace(/\s/, '\\ '))
	console.log('length', html.length)
	info[file_name] = html
	const parser = new DeckParser(file_name, {cherry: true}, info)


	console.log('Done!')

main('Nested Toggles.html')