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
				# For now leave image urls untouched, maybe this can be reconsidered or an option later
				# Also it breaks if we can't find the suffix so temporary workaround.
				if !imagePath.includes('http')
					const suffix = ExpressionHelper.suffix(imagePath)
					let image = files["{imagePath}"]
					const newName = self.newImageName(imagePath) + suffix
					exporter.addMedia(newName, image)
					card.backSide = card.backSide.replace(imageMatch[0], "<img src='{newName}' />")

			// For now treat Latex as text and wrap it around.
			// This is fragile thougg and won't handle multiline properly
			if ExpressionHelper.latex?(card.backSide)
				card.backSide = "[latex]{card.backSide.trim()}[/latex]"
			else
				card.backSide = converter.makeHtml(card.backSide)

			// Hopefully this should perserve headings and other things
			exporter.addCard(card.name, card.backSide)
		
		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');