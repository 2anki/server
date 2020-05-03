const FileSaver = require('file-saver')

import ZipHandler from './ZipHandler'
import DeckHandler from './DeckHandler'
import ExpressionHelper from './ExpressionHelper'
import APKGBuilder from './APKGBuilder'

// Components
import './components/header'
import './components/footer'

### css
body {
	text-align: center;
}
###

### css scoped
.container {
	width: 80%;
	margin: 0 auto;
}

.center-file {
	justify-content: center;
	flex-direction: column;
}

.file-label {
	align-items: center;
}
###

let progressText = ''
tag app-root

	def log msg
		console.log(msg)
		window.panelMessages ||= []
		window.panelMessages.push(msg)
		imba.commit()

	def handleFileUpload event
		imba.commit()
		const packages = []
		window.panelLog('Reading uploads locally')
		window.panelLog("You have {event.target.files.length} files")
		for file in event.target.files
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(file)
			window.panelLog("Found {zip_handler.filenames()}")
			for file_name in zip_handler.filenames()
				window.panelLog("Reading {file_name}")
				if ExpressionHelper.markdown?(file_name)
					window.panelLog("Building deck {file_name}")
					const deck = DeckHandler.new().build(zip_handler.files[file_name])
					const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
					packages.push({name: "{file_name}.apkg", apkg: apkg})
					window.panelLog("Done building {file_name}")
		
		window.panelLog("Preparing download from memory")
		for pkg in packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		window.panelMessages = []

	def mount
		window.panelLog = self.log
		setTimeout(&, 1000) do
			const input = document.getElementById('upload')
			input.addEventListener("change", self.handleFileUpload, false)

	def render
		<self>
			<n2a-header>
			<section .section>
				<div .container .is-centered>
					// File Upload
					<div .has-text-centered>
						<p .subtitle> 
							"This is a simple web app to convert your Notion "
							<a href="https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"> "Toggle lists "
							" to Anki cards."
							<br>
							"Image support is included 😉"
						<p .subtitle>
							// "Upload your exported Notion zip file. "
							"If you are worried about sharing your data, "
							"please read the "
							<a href="#privacy"> "privacy section below."			
						<div .has-text-centered .file .is-boxed .center-file>
							if window.panelMessages and window.panelMessages.length > 0
								<p .subtitle> "Loading, please wait. This might take a while depending on the size."
								<div .tags>
									for msg in window.panelMessages
										<span .tag> msg
								<button .button .is-loading>
								<p .subtilte> progressText
							else
								<label .file-label>
									<input#upload .file-input type="file" name="resume" accept=".zip">
									<span .file-cta>
										<span .file-icon>
											<i .fas .fa-upload>
									<span .file-label> "Choose a exported Notion file…"						
						<br>
						"Currently only the Markdown & CSV option is supported."
						<br>
						"If you are missing a feature or format, let me know on "
						<a href="https://github.com/alemayhu/notion2anki"> "GitHub"
						"."

			<section .section>
				<div .container>
					<h2 .title>
						<a href="#usage" name="usage"> "Usage"
					<hr>					
					<p .subtitle> "Confused by how to use this? See the video for how to create your lists and export them."
					<iframe width="560" height="315" src="https://www.youtube.com/embed/b3eQ0exhdz4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
					<h2 .title>
						<a href="#privacy" name="privacy"> "Privacy"
					<hr>
					<p .subtitle>
						"In case you are worried about privacy, let me explain how this site runs:"
					<p .subtitle>
						<strong> "This tool is a static site which runs totally in your browser. "
					<p .subtitle>
						"That means all of the file handling is done on your machine, I never see any off it. "
					<p .subtitle>
						"In case you are curious how this is possible see the links in the footer. "
					<p .subtitle>
						"You can also read the source code at "
						<a href="https://github.com/alemayhu/notion2anki"> "alemayhu/notion2anki"
			<n2a-footer>