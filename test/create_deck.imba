const path = require('path')
const fs = require('fs')

import DeckHandler from '../src/handlers/DeckHandler'
import APKGBuilder from '../src/handlers/APKGBuilder'
import ZipHandler from '../src/handlers/ZipHandler'
import ExpressionHelper from '../src/handlers/ExpressionHelper'

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
		const isMarkdown = ExpressionHelper.document?(example)
		let builder = DeckHandler.new(isMarkdown)
		const deck = builder.build(example)
		
		eq(deck.style != undefined, true, "Style is not set")

		console.log('deck.name', deck.name)
		eq(deck.name, deck_name, 'comparing deck names')
		eq(deck.cards.length, card_count, 'comparing deck count')

		if card_count > 0
			const zip_file_path = path.join(__dirname, "artifacts", "{deck.name}.apkg")
			await APKGBuilder.new().build(zip_file_path, deck, files)
			eq(fs.existsSync(zip_file_path), true, 'ensuring output was created')
	catch e
		console.error(e)
		process.exit(1)

def main
	console.time('execution time')
	console.log('Running tests')

	const artifacts_dir = path.join(__dirname, "artifacts")
	if not fs.existsSync(artifacts_dir)
		fs.mkdirSync(artifacts_dir)

	test_fixture('workflowy-export.html', 'DNS flashcards', 2)
	test_fixture('no-images.html', 'HTML test', 2)
	test_fixture('with-image.html', 'HTML test', 3)
	process.exit(0)

	test_fixture('simple-deck.md', 'Notion Questions', 3)
	test_fixture('empty-deck.md', 'Empty Deck', 0)

	const example_dir = path.join(artifacts_dir, 'files')
	const images = ["Untitled.png", "Untitled 1.png", "Untitled 2.png"]
	let files = {}
	for img in images
		const img_path = path.join(example_dir, img)
		console.log('img', img_path)
		files["Notion Questions/{img}"] = fs.readFileSync(img_path)
	test_fixture('with-images.md', 'Notion Questions', 3, files)

	// TODO: fix this test
	// const zip_path = path.join(artifacts_dir, 'Export-952356ce-4c7a-4416-9aaa-6abe99917124.zip')
	// const zip_data = fs.readFileSync(zip_path)
	// const zipHandler = ZipHandler.new()	
	// const _ = await zipHandler.build(zip_data)
	// eq(zipHandler.filenames().length, 4)
	
	// for file in zipHandler.filenames()
	// 	if ExpressionHelper.document?(file)
	// 		const deck = DeckHandler.new().build(zipHandler.files[file])
	// 		const apkgOutput = await APKGBuilder.new().build(null, deck, zipHandler.files)
	// 		assert.notEqual(apkgOutput, undefined)


	console.log('All assertions done 👍🏽')
	console.timeEnd('execution time')
	process.exit(0)

if process.main != module
	main()