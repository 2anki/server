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

	def handleHTML contents, deckName = null
		const inputType = 'HTML'
		const dom = cheerio.load(contents)
		const name = dom('title').text()
		let style = /<style[^>]*>([^<]+)<\/style>/i.exec(contents)[1]
		const toggleList = dom('.toggle li').toArray()
		const cards = toggleList.map do |t|
			const toggle = dom(t).find('details')
			const summary = toggle.find('summary').html()
			const backSide = toggle.html()
			return {name: summary, backSide: backSide}

		console.log('cards')
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
			if ExpressionHelper.toggleList?(line) # Card match on the toggle list
				i = i + 1
				// Before converting to HTML, replace the first dash so we don't end up with a dot on the left side in Anki
				cards[i] = {name: self.converter.makeHtml(line.replace(/^-\s?/, '')), backSide: ''}
			else
				// Prevent Notion from producing crappy Markdown
				cards[i].backSide += "{line.trim()}\n"
		{name, cards, inputType, style}