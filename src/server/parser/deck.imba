import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

import AnkiExport from 'anki-apkg-export'
import marked from 'marked'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, NoCardsError} from '../constants'

export class DeckParser

	prop defaultDeckStyle

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
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

	def worklflowyName dom
		const names = dom('.name .innerContentContainer')
		return null if !names
		names.first().text()

	def handleHTML contents, deckName = null
		const inputType = 'HTML'
		const dom = cheerio.load(contents)
		let name = dom('title').text()
		name ||= worklflowyName(dom)
		let style = /<style[^>]*>([^<]+)<\/style>/i.exec(contents)[1]
		if style
			style = appendDefaultStyle(style)
		const toggleList = dom('.toggle li').toArray()
		let cards = toggleList.map do |t|
			const toggle = dom(t).find('details')
			const summary = toggle.find('summary').html()
			const backSide = toggle.html()
			return {name: summary, backSide: backSide}

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

	def  findNullIndex coll, field
		return coll.findIndex do |x| x[field] == null


	def deck_name_for parent = null, name
		name = name.replace('#', '').trim()
		return "{parent}::{name}" if parent 
		return name

	def handleMarkdown contents, deckName = null
		let style = self.defaultStyle()
		let lines = contents.split('\n')
		const inputType = 'md'
		const decks = []

		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
		lines.shift()

		# TODO: do we really need to add the style to all of the decks?
		# ^ Would it be better to add a custom css file and include it?
		decks.push({name: name, cards:[], style: style, inputType: inputType})
		if lines[0] == ''
			lines.shift()

		for line of lines
			continue if !line || !(line.trim())
			console.log('line', line)
			# NB: Only top level toggle lists are considered the front
			const cd = decks[decks.length - 1]
			if line.match(/^-/)
				const front = marked(line.replace('- ', ''))
				cd.cards.push({name: front, backSide: null})
				continue

			# NB: Assume everything after toggle marker is on the backside
			# Don't make backside HTML just yet, the image rewriting will happen later
			const unsetBackSide = self.findNullIndex(cd.cards, 'backSide')
			if unsetBackSide > -1
				cd.cards[unsetBackSide].backSide = line + '\n'
			else
				console.log('cd.cards', cd.cards, unsetBackSide)
				try 
					cd.cards[cd.cards.length - 1].backSide += line + '\n'
				catch e
					console.error(e)
					console.log('i', i)
					# Parsing failed, try multi deck
					i = i - 1
					continue
			
		if decks.length > 0
			let single = decks.shift()
			console.log('make it one')
			for d in decks
				for card in d.cards
					const didMatch = single.cards.find do |s|
						s.name == card.name && s.backSide == card.backSide
					# We don't want duplicates
					if !didMatch
						card.tags = [d.name]
						single.cards.push(card)
			
			return single
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

	// https://stackoverflow.com/questions/20128238/regex-to-match-markdown-image-pattern-with-the-given-filename	
	def mdImageMatch input
		return false if !input

		input.match(/!\[(.*?)\]\((.*?)\)/)

	def isLatex backSide
		return false if !backSide

		const l = backSide.trim()
		l.match(/^\\/) or l.match(/^\$\$/) or l.match(/{{/)

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
			// For now treat Latex as text and wrap it around.
			// This is fragile thougg and won't handle multiline properly
			if self.latex?(card.backSide)
				card.backSide = "[latex]{card.backSide.trim()}[/latex]"

			// Prepare the Markdown for image path transformations
			if deck.inputType != 'HTML'
				card.backSide = marked(card.backSide || '<p>empty backside</p>')
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

def isMarkdown file
	return false if !file

	file.match(/\.md$/)

export def PrepareDeck file_name, files, settings
		const decks = DeckParser.new(isMarkdown(file_name), files[file_name], settings)
		const deck = decks.payload
		const apkg = await decks.build(null, deck, files)
		{name: "{deck.name}.apkg", apkg: apkg, deck: deck}