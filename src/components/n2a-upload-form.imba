tag n2a-upload-form
	prop downloadLink = null
	prop errorMessage = null
	prop state = 'ready'	
	prop deckName = null # TODO: fix broken? 
	prop step = 0

	def fileSelected
		$selectorBackground.style.background="mediumseagreen"
		$selectorLabel.textContent = "File Selected"
		let filePath = $selectorInput.value
		if let selectedFile = filePath.split(/(\\|\/)/g).pop()
			$selectorFileName.textContent = selectedFile
		else
			$selectorFileName.textContent = "🤷🏽‍♀️"
		state = 'file-selected'

	def convertFile event
		state = 'uploading'
		errorMessage = null
		try
			const stored_fields = Object.entries(window.localStorage)
			const formData = new FormData(event.target)
			for sf of stored_fields
				formData.append(sf[0], sf[1])
			
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

	def render
		<self>
			<.container[mb: 2rem]>
				<.has-text-centered[max-width: 640px m: 0 auto]>
						<h1.title .is-1[mb: 1rem]> "Notion to Anki"			
			<.container[p: 1rem max-width: 480px m: 0 auto] .has-text-centered>
				<form enctype="multipart/form-data" method="post" @submit.prevent=convertFile>
						<div.field[d:none]=(step != 0)>
							<div.file.is-centered.is-boxed.is-success.has-name>
								<.field>
									<label.file-label>
										<input$selectorInput.file-input type="file" name="pakker" accept=".zip,.html,.md" required @change.fileSelected() multiple="multiple">
										<span$selectorBackground.file-cta[bg: gray]>
											<span$selectorLabel.file-label> "Click to Upload…"
										<span$selectorFileName.file-name> "My Notion Export.zip"
							<button[mt: 2rem].button.cta .is-large .is-primary type="submit" disabled=(!$selectorInput.value)> "Convert"
							if errorMessage
								<h1 .title .is-3> "Oh snap, just got an error 😢"
								<p .subtitle> "Please refresh and try again otherwise report this bug to the developer on Discord with a screenshot 📸"
								<.notification .is-danger innerHTML=errorMessage>
								<a.button target="_blank" href="https://discord.gg/PSKC3uS">
									<span> "Discord"
							elif downloadLink
								<.field> <download-modal title="Download Ready 🥳" downloadLink=downloadLink deckName=deckName>
							elif state == 'uploading'
								<p .subtitle> "Loading, please wait. This might take a while depending on the size."
								<button .button .is-loading>