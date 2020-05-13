tag upload-section	
	def render
		<self .block .p-4 .text-2xl>
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
				<div .m-4 .p-4 .h-64 .flex .items-center .justify-center>
					<input :change.fileuploaded type="file" name="resume" accept=".zip">

			<p .text-center .p-4 .text-xl .text-gray-600>
				"Currently only the Markdown & CSV option is supported."
				"If you are missing a feature or format, let me know on "
				<a .underline .text-blue-700 href="https://github.com/alemayhu/notion2anki"> "GitHub"
				"."		