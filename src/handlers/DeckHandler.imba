import cheerio from 'cheerio'

import ExpressionHelper from './ExpressionHelper'
import MarkdownHandler from './MarkdownHandler'

export default class DeckHandler

	def constructor md
		if md
			self.converter = MarkdownHandler()

	def pickDefaultDeckName firstLine
		const name = firstLine ? firstLine.trim() : 'Untitled Deck'
		firstLine.trim().replace(/^# /, '')

	def build contents, deckName = null
		if self.converter
			return handleMarkdown(contents, deckName)
		self.handleHTML(contents, deckName)
	
	def appendDefaultStyle s
		const a = '.card {\nfont-family: arial;\name\nfont-size: 20px;\ntext-align: center;\ncolor: black;\nbackground-color: white;\n'
		"{s}\n{a}"

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
		let lines = contents.split('\n')
		const inputType = 'md'
		const decks = []
		let style = null

		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
		lines.shift()

		decks.push({name: name, cards:[]})
		if lines[0] == ''
			lines.shift()
		let cards = []

		for line of lines
			continue if !line || !(line.trim())

			if line.match(/^#/)
				decks.push({name: deck_name_for(name, line), cards: []})
				i = i + 1
				continue

			if line.match(/^-\s/)
				const last_deck = decks[decks.length - 1]
				let parent = name
				if last_deck
					parent = last_deck.name
				decks.push({name: deck_name_for(parent, line), cards: []})
				i = i + 1
				continue

			const cd = decks[decks.length - 1]
			if line.match(/^\s{4}-/)	
				const front = self.converter.makeHtml(line.replace('- ', '').trim())
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