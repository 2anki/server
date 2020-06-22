import crypto from 'crypto'
import fs from 'fs'

import AnkiExport from 'anki-apkg-export'
import showdown from 'showdown'
import cheerio from 'cheerio'

export default class DeckParser

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
		// TODO: rename converter to be more md specific
		self.converter = showdown.Converter.new()

		if md
			self.payload = handleMarkdown(contents, deckName)
		else 
			self.payload = handleHTML(contents, deckName)

	def pickDefaultDeckName firstLine
		const name = firstLine ? firstLine.trim() : 'Untitled Deck'
		firstLine.trim().replace(/^# /, '')

	// TODO: provide our own default amazing style
	def defaultStyle
		let a = '.card {\nfont-family: arial;\nfont-size: 20px;\ntext-align: center;\ncolor: black;\nbackground-color: white;\n}'
		if let settings = self.settings
			a = a.replace(/font-size: 20px/g, "font-size: {settings['font-size']}px")
		a

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

		sanityCheck(cards)
		{name, cards, inputType, style}

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

		const is_multi_deck = lines.find do $1.match(/^\s{8}-/)
		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
		lines.shift()

		# TODO: do we really need to add the style to all of the decks?
		# ^ Would it be better to add a custom css file and include it?
		decks.push({name: name, cards:[], style: style})
		if lines[0] == ''
			lines.shift()
		let cards = []

		for line of lines
			continue if !line || !(line.trim())
			console.log('line', line)
			if line.match(/^#/) && is_multi_deck
				decks.push({name: deck_name_for(name, line), cards: [], style: style})
				i = i + 1
				continue

			if line.match(/^-\s/) && is_multi_deck
				const last_deck = decks[decks.length - 1]
				let parent = name
				if last_deck
					parent = last_deck.name
				decks.push({name: deck_name_for(parent, line), cards: [], style: style})
				i = i + 1
				continue

			const cd = decks[decks.length - 1]
			if (line.match(/^\s{4}-/) && is_multi_deck) || (line.match(/^-/) && !is_multi_deck)
				const front = converter.makeHtml(line.replace('- ', '').trim())
				cd.cards.push({name: front, backSide: null})
				continue

			# Don't make backside HTML just yet, the image rewriting will happen later
			const unsetBackSide = self.findNullIndex(cd.cards, 'backSide')
			if unsetBackSide > -1
				cd.cards[unsetBackSide].backSide = line.trim() + '\n'
			else
				cd.cards[cd.cards.length - 1].backSide += line.trim() + '\n'

		return decks


	def sanityCheck cards
		let empty = cards.find do |x|
			!x.name or x.backSide
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')

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

	// TODO: refactor
	def build output, deck, files
		let exporter = self.setupExporter(deck)
		for card in deck.cards
			// Try getting Markdown image, should it be recursive for HTML and Markdown?
			let imageMatch = self.mdImageMatch(card.backSide)
			if !imageMatch && deck.inputType == 'HTML'
				imageMatch = self.imgur?(card.backSide)
			if imageMatch
				const imagePath = global.decodeURIComponent(imageMatch[1])
				# For now leave image urls untouched, maybe this can be reconsidered or an option later
				# Also it breaks if we can't find the suffix so temporary workaround.
				if !imagePath.includes('http')
					const suffix = self.suffix(imagePath)
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
			if self.latex?(card.backSide)
				card.backSide = "[latex]{card.backSide.trim()}[/latex]"
			elif card.inputType != 'HTML'
				card.backSide = converter.makeHtml(card.backSide)

			// Hopefully this should perserve headings and other things
			exporter.addCard(card.name, card.backSide || 'empty backside')

		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');			