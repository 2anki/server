tag preview-section

	prop cards
	prop index = 0 
	prop side = 'front'

	def toggleSide
		if side == 'front'
			side = 'back'
		else
			side = 'front'
	
	def nextCard
		index = index + 1
	
	def previousCard
		index = index - 1

	def navigation-buttons
		if cards.length > 1
			<button :click.nextCard disabled=(index < cards.length - 1)> "Next"
			<button :click.previousCard disabled=(index > cards.length - 1)> "Previous"
		<button :click.downloadDeck> "Download"


	# TODO: support latex and other markup not covered by using innerHTML
	def render
		<self>
			if !cards
				<div .has-text-centered .file .is-boxed .center-file>
					<p .subtitle> "Reading uploads locally"
					<p .subtitle> "Loading, please wait. This might take a while depending on the size."
					<button .button .is-loading>
			else
				<h2> "Card previews"
				<p> "Everything within the border below is what will be sent to Anki."
				<p> "Use the bottoms below to inspect the cards"
				<h2> "Card {side}"
				<button :click.toggleSide> "Switch side"
				navigationButtons()
				<div .card-preview>
					if side == 'front'
						<div innerHTML=cards[index].name>
					else
						<div innerHTML=cards[index].backSide>
