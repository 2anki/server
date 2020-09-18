import '../components/n2a-button'
import '../components/progress-bar'
import '../components/download-modal'

tag upload-page

	prop downloadLink = null
	prop errorMessage = null
	prop deckName = null
	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20

	get canShowTwitchPromo
		false # window.localStorage.getItem('canShowTwitchPromo')
	
	def convertFile event
		unless state == 'ready'
			return
		state = 'uploading'
		errorMessage = null
		try
			console.log('$input', $input.value)
			const form = event.target
			const formData = new FormData(form)
			const request = await window.fetch('/upload', {method: 'post', body: formData})
			const contentType = request.headers.get('Content-Type')

			if request.status != 200 # OK
				const text = await request.text()
				errorMessage = "status.code={request.status}\n{text}"
				return errorMessage

			# TODO: add unqiue timestamp to filename for uniqueness
			deckName = contentType == 'application/zip' ? "Your Decks.zip" : "Your deck.apkg"
			const blob = await request.blob()
			downloadLink = window.URL.createObjectURL(blob)
		catch error
			errorMessage = error ? "<h1 class='title is-4'>{error.message}</h1><pre>{error.stack}</pre>" : ""

	def didDownload
		downloadLink = null
		state = 'ready'
	
	def fileSelected
		$selectorBackground.style.background="mediumseagreen"
		$selectorLabel.textContent = "File Selected"
		let filePath = $selectorInput.value
		let selectedFile = filePath.split(/(\\|\/)/g).pop()
		$selectorFileName.textContent = selectedFile

	def hideTwitchPromo
		window.localStorage.setItem('canShowTwitchPromo', false)

	def render
		<self[d: block py: 4rem]>
			if canShowTwitchPromo
				<.has-text-centered[p: 2]>
					<.notification[d: inline-block]>
						<button .delete @click.hideTwitchPromo>
						"Going live on 💜 {<a target="_blank" href="https://www.twitch.tv/alemayhu"> "Twitch"} today!"
			<.section>
				<.container[mb: 2rem]>
					<.has-text-centered>
							<h1.title .is-1[mb: 1rem]> "Upload a Notion export to create Anki flashcards"			
							<p.subtitle[mt: 1rem]> "Not sure how to export? See this tutorial {<a target='_blank' href="https://youtu.be/lpC7C9wJoTA "> "Video Tutorial: How to use notion2anki..."}."
				<.container[p: 1rem max-width: 480px m: 0 auto].box>
					<form enctype="multipart/form-data" method="post" @submit.prevent=convertFile>
						<.field>
							<label.label> "Deck Name"
							<.control>
								<input$input.input[fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" name="deckName" type="text">
						<.field>	
							<label.label> "Card Types" 
							<.control[mt: 1rem].control.has-icons-left>
								<div.select.is-medium>
									<.select> 
										<select$cardType name="card-type">
											<option value="cloze"> "Cloze deletion"
											<option value="basic"> "Basic front and back"
											<option value="basic-reversed"> "Basic and reversed"
											<option value="reversed"> "Just the reversed"
											<option value="enable-input"> "Treat bold text as input"
								<span.icon.is-large.is-left>
									<i.fas.fa-chalkboard>
						<.field>
							<label.label> "Toggle Mode" 
							<.control[mt: 1rem].control.has-icons-left>
								<div.select.is-medium>
									<.select> 
										<select$toggleMode name="toggle-mode">
											<option value="open_toggle"> "Open nested toggles"
											<option value="close_toggle"> "Close nested toggles"
								<span.icon.is-large.is-left>
									<i .fas .fa-stream>
						<.field>
							<label.label> "Font Size" 
							<.control[d: grid jc: start]>
								<div[bd: 1px solid lightgray br: 5px p: 0]>
									<p> for fontPreset in [32, 26, 20, 12, 10]
											<span[fs: {fontPreset}px p: 3px br: 5px m: 0 8px] [c: #00d1b2]=(fontPreset == fontSize) @click.{fontSize = fontPreset}> "Aa"
						if errorMessage
							<.has-text-centered[m: 2rem]>
								<h1 .title .is-3> "Oh snap, just got an error 😢"
								<p .subtitle> "Please refresh and try again otherwise report this bug to the developer on Discord with a screenshot 📸"
								<.notification .is-danger innerHTML=errorMessage>
								<a.button target="_blank" href="https://discord.gg/PSKC3uS">
									<span.icon>
										<i.fab.fa-discord>
									<span> "Discord"
						else
							<div.field>
								<div.file.is-centered.is-boxed.is-success.has-name>
									<label.file-label>
										<input$selectorInput.file-input type="file" name="pakker" accept=".zip,.html,.md" required @change=fileSelected multiple="multiple">
										<span$selectorBackground.file-cta[bg: gray]>
											<span.file-icon>
												<i.fas.fa-upload>
											<span$selectorLabel.file-label> "Click to Upload…"
										<span$selectorFileName.file-name> "My Notion Export.zip"
							<.has-text-centered>
								if downloadLink
									<download-modal title="Download Ready 🥳" downloadLink=downloadLink deckName=deckName>
								elif state == 'ready'
									<button[mt: 2rem].button.cta .is-large .is-primary type="submit"> "Convert"
								else
									<button[mt: 2rem].button.cta .is-large .is-primary type="submit"> <i .fa .fa-spinner .fa-spin> ""