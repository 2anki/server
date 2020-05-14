tag n2a-button

	def render
		<self .block .p-2>
			<button .text-4xl .bg-blue-700 .hover:bg-transparent .hover:text-black font-bold .px-8 .py-2 .rounded .text-white>
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
		<self .block .p-8 .w-screen>
			<div css:max-width="720px" css:margin="0 auto" .flex .flex-col .justify-center .items-center>
				if !cards
					<div .has-text-centered .file .is-boxed .center-file>
						<p .subtitle> "Reading uploads locally"
						<p .subtitle> "Loading, please wait. This might take a while depending on the size."
						<button .button .is-loading>
				else
					<h3 .text-xl .p-2> "File ready to download just click the button to export your deck file"
					<n2a-button :click.downloadDeck> "Download"