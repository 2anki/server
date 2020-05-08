tag upload-section	
	def render
		<self>
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
								<label .file-label>
										<input :change.fileuploaded .file-input type="file" name="resume" accept=".zip">
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