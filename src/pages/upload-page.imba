import '../components/page-content'
import '../components/n2a-button'
import '../components/progress-bar'

import {upload_path} from '../server/endpoints'

tag upload-page

	prop errorMessage = null
	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20
	
	def isDebug
		window.location.hostname == 'localhost'

	def convertFile event
		unless state == 'ready'
			return
		state = 'uploading'
		errorMessage = null
		try
			const form = event.target
			const formData = new FormData(form)
			const request = await window.fetch(upload_path, {method: 'post', body: formData})
			console.log(request.headers)
			if request.status != 200 # OK
				const text = await request.text()
				errorMessage = "status.code={request.status}\n{text}"
				return errorMessage
			console.log($input)
			const inputName = $input.value
			const filename = inputName ? "{inputName}.apkg" : "{window.btoa(new Date()).substring(0, 7)}.apkg".replace(/\s/g, '-')
			const blob = await request.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = filename
			a.click()
			setTimeout(&, 3000) do
				state = 'ready'
		catch error
			errorMessage = error ? "<h1 class='title is-4'>{error.message}</h1><pre>{error.stack}</pre>" : ""

	def render
		<self>
			<.section>
				<.container>
					<h1.title> "Pick your options"
					<hr>
					<p.subtitle> "Only the zip or HTML file is required. Please use the exported ZIP file to get all your images."
					<form enctype="multipart/form-data" method="post" @submit.prevent=convertFile>
						<h3 .title .is-3> "Deck Name" 
						<input$input.input[fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" name="deckName" type="text">
						<h3[mt: 2rem] .title .is-3> "Card Types" 
						<div[mt: 1rem].control.has-icons-left>
							<div.select.is-medium>
								<.select>
									<select name="card-type">
										<option value="cloze"> "Cloze deletion"
										<option value="basic"> "Basic front and back"
										<option value="basic-reversed"> "Basic and reversed"
										<option value="reversed"> "Just the reversed"
							<div[mt: 1rem]>
								<p.subtitle> "Cloze deletions are so powerful that they are now the default in notion2Anki."
							<span.icon.is-large.is-left>
								<i.fas.fa-chalkboard>
						<h3[mt: 2rem] .title .is-3> "Media Options" 
						<p.has-text-centered .subtitle> "Coming soon"
						<.has-text-centered>
							<p> "Join the Discord server to get notified of changes!"
							<a.button target="_blank" href="https://discord.gg/PSKC3uS">
								<span.icon>
									<i.fab.fa-discord>
								<span> "Discord"
						<h3[mt: 2rem] .title .is-3> "Notion Export File"
						<p.subtitle[mt: 1rem]> "Not sure how to export? See this tutorial {<a target='_blank' href="https://youtu.be/lpC7C9wJoTA "> "Video Tutorial: How to use notion2anki..."}."
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
										<input.file-input type="file" name="pkg" accept=".zip,.html,.md" required>
										<span.file-cta>
											<span.file-icon>
												<i.fas.fa-upload>
											<span.file-label> "Click to Upload…"
										<span.file-name> "My Notion Export.zip"
							<.has-text-centered>
								<button[mt: 2rem].button.cta .is-large .is-primary type="submit">
									if state == 'ready'
										"Convert"
									else
										<i .fa .fa-spinner .fa-spin> ""
								if state != 'ready'
										<p> "Check your downloads folder for the file and refresh page before new uploads."
			<.section>
				<.container>
					<h3 .title .is-3> "Support this project"
					<hr>
					<p.subtitle> "This project is 100% free and will remain free but please if you have the means you can support this project via these options:"
					<.has-text-centered>
						<a href="https://patreon.com/ccscanf"> <img src="become_a_patron_button.png">
					<.has-text-centered>
						<a.button .is-large href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WUARHGVHUZ5FL&source=ur">
							<span .icon .is-large> <i .fab .fa-paypal aria-hidden="true">
							<span> "Paypal"
					<div[mt: 2]>
						<iframe src="https://github.com/sponsors/alemayhu/card" title="Sponsor alemayhu" height="225" width="600" style="border: 0;">
					<h4 .title .is-4> "Other Ways to Contribute"
					<p.subtitle> 
						"If you know someone who can benefit from notion2anki, please share it with them. We want to save people time, anywhere in the world! "
						"If you are missing a feature or format, let me know on {<a href="https://github.com/alemayhu/notion2anki"> "GitHub"} or the {<a href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}."													