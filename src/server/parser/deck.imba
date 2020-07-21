import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

import AnkiExport from 'anki-apkg-export'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, NoCardsError} from '../constants'

export class DeckParser

	prop defaultDeckStyle

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
		if md
			throw new Error('Markdown support has been removed, please use HTML.')

		self.payload = md ? handleMarkdown(contents, deckName) : handleHTML(contents, deckName)

	def pickDefaultDeckName firstLine
		const name = firstLine ? firstLine.trim() : 'Untitled Deck'
		firstLine.trim().replace(/^# /, '')

	def defaultStyle
		const name = 'default'
		let style = fs.readFileSync(path.join(TEMPLATE_DIR, "{name}.css")).toString()
		# Use the user's supplied settings
		if let settings = self.settings
			style = style.replace(/font-size: 20px/g, "font-size: {settings['font-size']}px")
		style

	def appendDefaultStyle s
		"{s}\n{defaultStyle()}"

	def handleHTML contents, deckName = null
		const inputType = 'HTML'
		const dom = cheerio.load(contents)
		let name = dom('title').text()
		let style = /<style[^>]*>([^<]+)<\/style>/i.exec(contents)[1]
		# TODO: delete default style?
		# if style
		# 	style = appendDefaultStyle(style)
		const toggleList = dom('.toggle li').toArray()
		let cards = toggleList.map do |t|
			const toggle = dom(t).find('details')
			const summary = toggle.find('summary').html()
			const backSide = toggle.html()
			return {name: summary, backSide: backSide}

		# TODO: is this a workflowy leftover?
		if cards.length == 0
			const list_items = dom('body ul').first().children().toArray()
			cards = list_items.map do |li|
				const el = dom(li)
				const front = el.find('.name .innerContentContainer').first()
				const back = el.find('ul').first().html()
				return {name: front, backSide: back}
		# Prevent bad cards from leaking out
		console.log('cards', cards)
		cards = sanityCheck(cards)
		if cards.length > 0
			return {name, cards, inputType, style}
		throw new NoCardsError()

	def sanityCheck cards
		let empty = cards.find do |x|
			!x.name or x.backSide
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')
			console.log('cards', cards)
		cards.filter do $1.name and $1.backSide

	// Try to avoid name conflicts and invalid characters by hashing
	def newImageName input
		var shasum = crypto.createHash('sha1')
		shasum.update(input)
		shasum.digest('hex')

	def suffix input
		return null if !input

		const m = input.match(/\.[0-9a-z]+$/i)
		return null if !m
		
		return m[0] if m

	def isImgur backSide
		return false if !backSide

		backSide.match(/\<img.+src\=(?:\"|\')(.+?)(?:\"|\')(?:.+?)\>/)
	
	def setupExporter deck
		// TODO: fix twemoji pdf font issues
		if deck.style
			deck.style = deck.style.split('\n').filter do |line|
				# TODO: fix font-family breaking with workflowy, maybe upstream bug?
				!line.includes('.pdf') && !line.includes('font-family')
			deck.style = deck.style.join('\n')
			return AnkiExport.new(deck.name, {css: deck.style})	
		AnkiExport.new(deck.name)

	def embedImage exporter, files, imagePath
		const suffix = self.suffix(imagePath)
		return null if !suffix

		let image = files["{imagePath}"]
		const newName = self.newImageName(imagePath) + suffix
		exporter.addMedia(newName, image)
		return newName

	// TODO: refactor
	def build output, deck, files
		console.log('building deck of type', deck.inputType)
		let exporter = self.setupExporter(deck)		
		const card_count = deck.cards.length
		deck.image_count = 0

		for card in deck.cards
			console.log("exporting {deck.name} {deck.cards.indexOf(card)} / {card_count}")
			// Prepare the Markdown for image path transformations
			if deck.inputType != 'HTML'
				card.backSide ||= '<p>empty backside</p>'
				# TODO: investigate why strikethrough is not working ~~colored~~
				card.backSide = self.converter.makeHtml(card.backSide.trim())
				console.log('card.backSide to html', card.backSide)

			const dom = cheerio.load(card.backSide)
			const images = dom('img')
			if images.length > 0
				console.log('Number of images', images.length)
				const oldNames = []
				images.each do |i, elem|
					const originalName = dom(elem).attr('src')
					if let newName = self.embedImage(exporter, files, global.decodeURIComponent(originalName))
						console.log('replacing', originalName, 'with', newName)
						card.backSide = card.backSide.replace(originalName, newName)
				deck.image_count += (card.backSide.match(/\<+\s?img/g) || []).length
			// Hopefully this should perserve headings and other things
			exporter.addCard(card.name, card.backSide, card.tags ? {tags: card.tags} : {})

		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');			

export def PrepareDeck file_name, files, settings
		const decks = DeckParser.new(file_name.match(/.md$/), files[file_name], settings)
		const deck = decks.payload
		const apkg = await decks.build(null, deck, files)
		{name: "{deck.name}.apkg", apkg: apkg, deck: deck}