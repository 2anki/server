const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

// Components
import './components/meta-section'
import './components/header'
import './components/footer'

let progressText = ''
tag app-root

	prop state = 'ready'

	
	def onfileuploaded evt, files
		console.log('files', files)

	def handleFileUpload event
		self.state = 'uploading'
		imba.commit()
		console.log('state', self.state)
		const packages = []
		console.log('Reading uploads locally')
		console.log("You have {event.target.files.length} files")
		for file in event.target.files
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(file)
			console.log("Found {zip_handler.filenames()}")
			for file_name in zip_handler.filenames()
				console.log("Reading {file_name}")
				if ExpressionHelper.markdown?(file_name)
					console.log("Building deck {file_name}")
					const deck = DeckHandler.new().build(zip_handler.files[file_name])
					const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
					packages.push({name: "{file_name}.apkg", apkg: apkg})
				console.log("Done building {file_name}")
		
		console.log("Preparing download from memory")
		for pkg in packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		state = 'ready'
		imba.commit()

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
						if state == 'ready'
							<div .has-text-centered .file .is-boxed .center-file>
								<label .file-label>
										<input :change.handleFileUpload .file-input type="file" name="resume" accept=".zip">
										<span .file-cta>
											<span .file-icon>
												<i .fas .fa-upload>
										<span .file-label> "Choose a exported Notion file…"	
						elif state == 'uploading'
							<p> 'One moment local upload in progress'
						else		
							<div .has-text-centered .file .is-boxed .center-file>
								<p .subtitle> "Loading, please wait. This might take a while depending on the size."
								<button .button .is-loading>
								<p .subtilte> progressText													
						<br>
						"Currently only the Markdown & CSV option is supported."
						<br>
						"If you are missing a feature or format, let me know on "
						<a href="https://github.com/alemayhu/notion2anki"> "GitHub"
						"."

			<meta-section>
			<n2a-footer>