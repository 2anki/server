var crypto = require('crypto')
const fs = require('fs')

import AnkiExport from 'anki-apkg-export'
import ExpressionHelper from './ExpressionHelper'
import MarkdownHandler from './MarkdownHandler'

export default class APKGBuilder

	// Try to avoid name conflicts and invalid characters by hashing
	def newImageName input
		var shasum = crypto.createHash('sha1')
		shasum.update(input)
		shasum.digest('hex')

	def build output, deck, files
		let exporter = AnkiExport.new(deck.name)
		const converter = MarkdownHandler()
		for card in deck.cards
			if let imageMatch = ExpressionHelper.imageMatch(card.backSide)		
				const imagePath = global.decodeURIComponent(imageMatch[1])
				const suffix = ExpressionHelper.suffix(imagePath)
				let image = files["{imagePath}"]
				const newName = self.newImageName(imagePath) + suffix
				exporter.addMedia(newName, image)
				card.backSide = card.backSide.replace(imageMatch[0], "<img src='{newName}' />")

			// Hopefully this should perserve headings and other things
			exporter.addCard(card.name, converter.makeHtml(card.backSide))
		
		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');