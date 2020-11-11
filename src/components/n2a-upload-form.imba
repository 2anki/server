tag n2a-upload-form
	prop fontSize = 20
	prop downloadLink = null
	prop errorMessage = null
	prop state = 'ready'	
	prop deckName = null # TODO: fix broken? 
	prop step = 0

	def fileSelected
		$selectorBackground.style.background="mediumseagreen"
		$selectorLabel.textContent = "File Selected"
		let filePath = $selectorInput.value
		let selectedFile = filePath.split(/(\\|\/)/g).pop()
		$selectorFileName.textContent = selectedFile
		step = 1
		console.log('step', step)

	def convertFile event
		unless state == 'ready'
			return
		state = 'uploading'
		errorMessage = null
		try
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
			
	def render
		<self>
			<.container[mb: 2rem]>
				<.has-text-centered[max-width: 640px m: 0 auto]>
						<h1.title .is-1[mb: 1rem]> "Upload a Notion export to create Anki flashcards {step}"			
			<.container[p: 1rem max-width: 480px m: 0 auto] .has-text-centered>
				<form enctype="multipart/form-data" method="post" @submit.prevent=convertFile>
					<.steps>
						<.step-item .is-active=(step==0)>
							<.step-marker> "1"
							<.step-details>
								<p.step-title> "Upload"
						<.step-item .is-active=(step==1)>
							<.step-marker> "2"
							<.step-details>
								<p.step-title> "Options"
						<.step-item.is-active=(step==2)>
							<.step-marker> "3"
							<.step-details>
								<p.step-title> "Download"
						<.step-content[m: 1rem auto]>
							<div.field[d:none]=(step != 0)>
								<div.file.is-centered.is-boxed.is-success.has-name>
									<label.file-label>
										<input$selectorInput.file-input type="file" name="pakker" accept=".zip,.html,.md" required @change.fileSelected() multiple="multiple">
										<span$selectorBackground.file-cta[bg: gray]>
											<span$selectorLabel.file-label> "Click to Upload…"
										<span$selectorFileName.file-name> "My Notion Export.zip"
						<.step-content[d:none]=(step != 1) [ta: left m: 0 auto mt: 1rem max-width: 480px]>
							<.field .box>
								<label.label> "Template"
								<.control[mt: 1rem].control>
									<.select .is-large>
										<select$template name="template">
											<option value="specialstyle"> "Default"
											<option value="notionstyle"> "Only Notion"
											<option value="nostyle"> "Raw Note (no style)"

							<.field .box>
								<label.label> "Toggle Mode" 
								<.control[mt: 1rem].control>
									<div.select.is-medium>
										<.select> 
											<select$toggleMode name="toggle-mode">
												<option value="open_toggle"> "Open nested toggles"
												<option value="close_toggle"> "Close nested toggles"
							<.field .box>
								<label.label> "Font Size" 
								<.control[d: grid jc: start]>
									<div[bd: 1px solid lightgray br: 5px p: 0]>
										<input bind=fontSize name='font-size' hidden>								
										<p> for fontPreset in [32, 26, 20, 12, 10]
												<span[fs: {fontPreset}px p: 3px br: 5px m: 0 8px] [c: #00d1b2]=(fontPreset == fontSize) @click.{fontSize = fontPreset}> "Aa"
						<.step-content[d:none]=(step != 2) [m: 0 auto max-width: 720px]>
							if errorMessage
								<h1 .title .is-3> "Oh snap, just got an error 😢"
								<p .subtitle> "Please refresh and try again otherwise report this bug to the developer on Discord with a screenshot 📸"
								<.notification .is-danger innerHTML=errorMessage>
								<a.button target="_blank" href="https://discord.gg/PSKC3uS">
									<span> "Discord"
							elif downloadLink
								<.field> <download-modal title="Download Ready 🥳" downloadLink=downloadLink deckName=deckName>
							elif state == 'ready'
								<.field[w: 320px]> <button[mt: 2rem].button.cta .is-large .is-primary type="submit"> "Convert"
							else
								<p .subtitle> "Loading, please wait. This might take a while depending on the size."
								<button .button .is-loading>
					<.step-actions .columns .has-text-centered .is-mobile>
						<.steps-action .column[d:none]=(step == 0)>
							<a .button .is-light=(step==0) @click.{step -= 1}> "Previous"
						<.steps-action .column [d:none]=(step >= 2 || step == 0)>
							<a .button .is-link @click.{step += 1}> "next"
