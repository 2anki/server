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

	def handleMarkdown contents, deckName = null
		const inputType = 'md'
		let lines = contents.split('\n')
		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
		let style = null

		if lines[0] == ''
			lines.shift()
		let cards = []

		let i = -1
		for line of lines
			continue if !line
			console.log('line', line)
			if line.match(/^\s{4}-/)	
				const unsetBackSide = self.findNullIndex(cards, 'backSide')
				if unsetBackSide > -1
					cards[unsetBackSide].backSide = line.replace('- ', '').trim()
				else
					cards.push({name: self.converter.makeHtml(line.replace('- ', '').trim()), backSide: null})
			else
				const unsetBackSide = self.findNullIndex(cards, 'backSide')
				if unsetBackSide > -1
					# Don't make backside HTML just yet, the image rewriting will happen later
					cards[unsetBackSide].backSide = line.replace('- ', '').trim()
				else
					console.log('warn unsupported', line)

		sanityCheck(cards)
		{name, cards, inputType, style}


	def sanityCheck cards
		let empty = cards.find do |x|
			!x.name or x.backSide
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')