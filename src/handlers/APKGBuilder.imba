var crypto = require('crypto')
const fs = require('fs')

import AnkiExport from 'anki-apkg-export'
import ExpressionHelper from './ExpressionHelper'
import MarkdownHandler from './MarkdownHandler'

export default class APKGBuilder

	def constructor md
		self.md = md

	// Try to avoid name conflicts and invalid characters by hashing
	def newImageName input
		var shasum = crypto.createHash('sha1')
		shasum.update(input)
		shasum.digest('hex')

	// TODO: refactor
	def build output, deck, files
		let exporter
		// TODO: fix twemoji pdf font issues
		if deck.style
			deck.style = deck.style.split('\n').filter do |line|
				# TODO: fix font-family breaking with workflowy, maybe upstream bug?
				!line.includes('.pdf') && !line.includes('font-family')
			deck.style = deck.style.join('\n')
			exporter = AnkiExport.new(deck.name, {css: deck.style})	
		else
			// TODO: provide our own default amazing style
			exporter = AnkiExport.new(deck.name)	

		const converter = MarkdownHandler()
		for card in deck.cards
			// Try getting Markdown image, should it be recursive for HTML and Markdown?
			let imageMatch = ExpressionHelper.imageMatch(card.backSide)
			if !imageMatch && deck.inputType == 'HTML'
				imageMatch = ExpressionHelper.imgur?(card.backSide)
			if imageMatch
				const imagePath = global.decodeURIComponent(imageMatch[1])
				# For now leave image urls untouched, maybe this can be reconsidered or an option later
				# Also it breaks if we can't find the suffix so temporary workaround.
				if !imagePath.includes('http')
					const suffix = ExpressionHelper.suffix(imagePath)
					if suffix
						let image = files["{imagePath}"]
						const newName = self.newImageName(imagePath) + suffix
						exporter.addMedia(newName, image)
						if deck.inputType == 'HTML'
							// Run twice in case there is a link tag as well
							card.backSide = card.backSide.replace(imageMatch[1], newName)
							card.backSide = card.backSide.replace(imageMatch[1], newName)
						else
							card.backSide = card.backSide.replace(imageMatch[0], "<img src='{newName}' />")

			// For now treat Latex as text and wrap it around.
			// This is fragile thougg and won't handle multiline properly
			if ExpressionHelper.latex?(card.backSide)
				card.backSide = "[latex]{card.backSide.trim()}[/latex]"
			elif inputType != 'HTML'
				card.backSide = converter.makeHtml(card.backSide)

			// Hopefully this should perserve headings and other things
			exporter.addCard(card.name, card.backSide || 'empty backside')

		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');