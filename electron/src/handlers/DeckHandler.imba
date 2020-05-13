
import ExpressionHelper from './ExpressionHelper'
import MarkdownHandler from './MarkdownHandler'

export default class DeckHandler

	def pickDefaultDeckName firstLine
		if firstLine and firstLine.trim().length > 0
			self.converter.makeHtml(firstLine)
		else
			'Untitled Deck'

	def build contents, deckName = null
		self.converter = self.converter || MarkdownHandler()

		let lines = contents.split('\n')
		const name = deckName ? deckName : pickDefaultDeckName(lines.shift())
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
		{name, cards}