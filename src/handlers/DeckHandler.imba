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

	def handleMarkdown contents, deckName = null
		const inputType = 'md'
		let lines = contents.split('\n')
		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
		let style = null

		if lines[0] == ''
			lines.shift()
		let cards = []

		let i = -1
		for line in lines
			console.log('line', line)
			if ExpressionHelper.toggleList?(line) # Card match on the toggle list
				i = i + 1
				// Before converting to HTML, replace the first dash so we don't end up with a dot on the left side in Anki
				cards[i] = {name: self.converter.makeHtml(line.replace(/^-\s?/, '')), backSide: ''}
			elif cards[i]
				// Prevent Notion from producing crappy Markdown
				cards[i].backSide += "{line.trim()}\n"
			else
				console.log('warn unsupported', line)

		sanityCheck(cards)
		{name, cards, inputType, style}


	def sanityCheck cards
		let empty = cards.find do |x|
			!x.name or x.backSide
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')