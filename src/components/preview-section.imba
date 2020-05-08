tag n2a-button

	def render
		<self .block>
			<button .bg-blue-700 .hover:bg-transparent .hover:text-black .p-2 .rounded .text-white>
				<slot>


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
		return if index + 1 >= cards.length
		index = index + 1
	
	def previousCard
		return if index - 1 < 0
		index = index - 1

	# TODO: support latex and other markup not covered by using innerHTML
	def render
		<self .block .p-8>
			if !cards
				<div .has-text-centered .file .is-boxed .center-file>
					<p .subtitle> "Reading uploads locally"
					<p .subtitle> "Loading, please wait. This might take a while depending on the size."
					<button .button .is-loading>
			else
				<h2 .text-4xl .text-center> "Card previews"
				<p .text-2xl> "Everything within the border below is what will be sent to Anki. Use the bottoms below to inspect the cards"
				<.flex .justify-between .p-4>
					<n2a-button :click.toggleSide> "Switch side"
					<h3 .self-center .m-2> "Card showing {side} ({index + 1}/{cards.length})"
					<n2a-button :click.nextCard> "Next"
					<n2a-button :click.previousCard> "Previous"
					<n2a-button :click.downloadDeck> "Download"
				<div .h-48 .flex .justify-center .p-4 .border .border-black .rounded>
					if side == 'front'
						<div .overflow-auto innerHTML=cards[index].name>
					else
						<div .overflow-auto innerHTML=cards[index].backSide>
