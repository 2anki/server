const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

// Components
import './components/meta-section'
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

			<meta-section>
			<n2a-footer>