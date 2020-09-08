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

def test_fixture file_name, deck_name, card_count, files = {}
	try
		const file_path = path.join(__dirname, "fixtures", file_name)
		const example = fs.readFileSync(file_path).toString()
		const isMarkdown = example.match(/.(md|html)$/)
		const p = {}
		p[file_name] = example
		const deck = new DeckParser(file_name, {}, p)		
		const payload = deck.payload[0]

		eq(payload.style != undefined, true, "Style is not set")

		console.log('deck.name', payload.name)
		eq(payload.name, deck_name, 'comparing deck names')
		eq(payload.cards.length, card_count, 'comparing deck count')

		if card_count > 0
			const zip_file_path = path.join(__dirname, "artifacts", "{payload.name}.apkg")
			await deck.build(zip_file_path, deck, files)
			eq(fs.existsSync(zip_file_path), true, 'ensuring output was created')
		return deck
	catch e
		console.error(e)
		process.exit(1)

def test_multiple_images
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
			eq(deck.deck.image_count, 6)

def main
	console.time('execution time')
	console.log('Running tests')

	const artifacts_dir = path.join(__dirname, "artifacts")
	if not fs.existsSync(artifacts_dir)
		fs.mkdirSync(artifacts_dir)

	test_fixture('no-images.html', 'HTML test', 2, )
	# test_fixture('with-image.html', 'HTML test', 3, {'HTML%20test%20202b0d67c0584bc6b1ce9e35b753128b/Skjermbilde_2020-05-13_kl._19.45.08.png': 'empty'})
	process.exit(0)

	const example_dir = path.join(artifacts_dir, 'files')
	const images = ["Untitled.png", "Untitled 1.png", "Untitled 2.png"]
	let files = {}
	for img in images
		const img_path = path.join(example_dir, img)
		console.log('img', img_path)
		files["Notion Questions/{img}"] = fs.readFileSync(img_path)

	// const zip_path = path.join(artifacts_dir, 'Export-952356ce-4c7a-4416-9aaa-6abe99917124.zip')
	// const zip_data = fs.readFileSync(zip_path)
	// const zipHandler = ZipHandler.new()	
	// const _ = await zipHandler.build(zip_data)
	// eq(zipHandler.filenames().length, 4)
	
	// for file in zipHandler.filenames()
	// 	if file.match(/.(md|html)$/)
	// 		const deck = DeckParser.new().build(zipHandler.files[file])
	// 		const apkgOutput = await deck.build(null, deck, zipHandler.files)
	// 		assert.notEqual(apkgOutput, undefined)


	console.log('All assertions done 👍🏽')
	console.timeEnd('execution time')
	process.exit(0)

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

if process.main != module
	test_multiple_images()
	main()