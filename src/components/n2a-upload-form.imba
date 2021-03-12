import {iget, iset} from '../data/storage'

tag n2a-upload-form
	prop downloadLink = null
	prop errorMessage = null
	prop state = 'ready'	
	prop deckName = null
	prop step = 0
	
	def setup
		showNotification = iget('show-notification') != false

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
				return errorMessage = text

			deckName = request.headers.get('File-Name')
			deckName ||= contentType == 'application/zip' ? "Your Decks.zip" : "Your deck.apkg"

			const blob = await request.blob()
			downloadLink = window.URL.createObjectURL(blob)
		catch error
			errorMessage = error ? "<h1 class='title is-4'>{error.message}</h1><pre>{error.stack}</pre>" : ""
	
	def hideNotification
		showNotification = false
		iset('show-notification', false) 

	def render
		<self>
			<.container[mb: 2rem]>
				<.has-text-centered[max-width: 640px m: 0 auto]>
					<h1.title .is-1[mb: 1rem]> "Notion to Anki"
			if errorMessage
				<section .hero .is-danger>
					<.hero-body>
						<div innerHTML=errorMessage>
						<p.subtitle> "Watch the video below and see if you are experiencing a common error or read the error message."
						<.has-text-centered>
							<iframe width="560" height="315" src="https://www.youtube.com/embed/CaND1Y3X6og" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="">
							<p> "If you still haven't resolved the issue yet after trying the above mentioned then join the server to report your issue"
							<a.button  rel="noreferrer" target="_blank" href="https://discord.gg/PSKC3uS">
								<span> "Discord"

			<.container[p: 1rem max-width: 480px m: 0 auto] .has-text-centered>
				<form enctype="multipart/form-data" method="post" @submit.prevent=convertFile>
					<div[bg: purple1 p: 1.5rem bd: 2.3px solid purple7 bs: inset m: 0 auto mb: 1rem ta: center] [d:none]=!showNotification>
						<button.delete aria-label="close" @click.hideNotification()>
						<p> "We only support {<a target="_blank" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7"> "HTML"} uploads from Notion."
						<p> "For tutorials checkout the official {<a target="_blank" href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd"> "playlist"}."
						<p[fw: bold]> "This project is 100% free and will remain free ✌️ {<span[c: grey fw: normal]> "#stillfree"}"				

					<div.field[d:none]=(step != 0)>
						<div.file.is-centered.is-boxed.is-success.has-name .is-large>
							<.field>
								<label.file-label>
									<input$selectorInput.file-input type="file" name="pakker" accept=".zip,.html,.md" required @change.fileSelected() multiple="multiple">
									<span$selectorBackground.file-cta[bg: gray]>
										<span$selectorLabel.file-label> "Click to Upload…"
									<span$selectorFileName.file-name> "My Notion Export.zip"
						<button[mt: 2rem].button.cta .is-large .is-primary type="submit" disabled=(!$selectorInput.value)> "Convert"
						if downloadLink and not errorMessage
							<.field> <download-modal title="Download Ready 🥳" downloadLink=downloadLink deckName=deckName>
						elif state == 'uploading'
							<p .subtitle> "Loading, please wait. This might take a while depending on the size."
							<button .button .is-loading>