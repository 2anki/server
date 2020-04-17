import ExpressionHelper from './ExpressionHelper'
export default class DeckHandler

	def build contents
		const titleMatch = ExpressionHelper.titleMatch(contents)
		let lines = contents.split('\n')
		var name = ''
		if titleMatch			
			name = ExpressionHelper.cleanTitle(titleMatch[0])
		else
			name = lines[0]
		lines.shift()
		if lines[0] == ''
			lines.shift()
		let cards = []

		let i = -1
		for line in lines
			if ExpressionHelper.toggleList?(line) # Card match on the toggle list
				i = i + 1
				cards[i] = {name: ExpressionHelper.cleanToggleName(line), backSide: ''}
			else
				cards[i].backSide += line
		{name, cards}