tag upload-section	

	def clickButton
		const button = document.getElementById('upload-button')
		button.click()

	def render
		<self .block .p-4 .text-2xl>
			<div css:max-width="720px" css:margin="0 auto">
				// File Upload
				// "Upload your exported Notion zip file. "
				// "Choose a exported Notion file…"	
				<p .p-4>
					"This is a simple web app to convert your Notion "
					<a .text-blue-700 .underline href="https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe"> "Toggle lists "
					" to Anki cards. Image support is included 😉"
					"If you are worried about sharing your data, "
					"please read the "
					<a .underline .text-blue-700 href="#privacy"> "privacy section below."
					<div .m-4 .p-4 .h-64 .flex .items-center .justify-center :click.clickButton>
						<div .text-4xl .font-bold .text-white .n2a-blue-bg .rounded-full .px-8 .py-2> "Choose a file"
						<input #upload-button .hidden :change.fileuploaded type="file" name="resume" accept=".zip">