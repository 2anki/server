const path = require('path')
const fs = require('fs')

import {DeckParser, PrepareDeck} from '../src/server/parser/deck'
import {ZipHandler} from '../src/server/files/zip'

def eq lhs, rhs, msg = null
	console.log('comparing', lhs, rhs, msg ? "reason: {msg}" : '')
	return if lhs == rhs
	try
		console.log("{JSON.stringify(lhs)} is not equal {JSON.stringify(rhs)}")
	catch e
		console.log('failed to show comparison failure')
	process.exit(1)




def main


	const fixtures_dir = path.join(__dirname, "fixtures")
	if not fs.existsSync(fixtures_dir)
		fs.mkdirSync(fixtures_dir)

	process.exit(0)

	const example_dir = path.join(fixtures_dir, 'files')
	const images = ["Untitled.png", "Untitled 1.png", "Untitled 2.png"]
	let files = {}
	for img in images
		const img_path = path.join(example_dir, img)
		console.log('img', img_path)
		files["Notion Questions/{img}"] = fs.readFileSync(img_path)

	// const zip_path = path.join(fixtures_dir, 'Export-952356ce-4c7a-4416-9aaa-6abe99917124.zip')
	// const zip_data = fs.readFileSync(zip_path)
	// const zipHandler = ZipHandler.new()	
	// const _ = await zipHandler.build(zip_data)
	// eq(zipHandler.filenames().length, 4)
	
	// for file in zipHandler.filenames()
	// 	if file.match(/.(md|html)$/)
	// 		const deck = DeckParser.new().build(zipHandler.files[file])
	// 		const apkgOutput = await deck.build(null, deck, zipHandler.files)
	// 		assert.notEqual(apkgOutput, undefined)