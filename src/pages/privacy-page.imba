import '../components/page-content'

tag privacy-page
	<self>
		<page-content>
			<div css:max-width="720px" css:margin="0 auto" .py-4>
				<div .flex .flex-col .items-center>
					<h2 .text-4xl>
						<a href="#privacy" name="privacy"> "Privacy Protection"
					<p .py-2 .text-xl>
						"In case you are worried about privacy, let me explain how this site runs:"
						<br>
						<strong> "This tool is a static site which runs totally on your browser."
						"That means all of the file handling is done on your machine, I never see any of it. "
						<br>
						"In case you are curious how this is possible see the links in the footer. "
						<br>
						"You can also read the source code at "
						<a .text-blue-600 href="https://github.com/alemayhu/notion2anki"> "alemayhu/notion2anki"
						<br>
						"This site is being served via"
						<a href="https://netlify.com"> " Netlify"
						".You can read their Privacy policy here "
						<a .text-blue-600 href="https://www.netlify.com/privacy/"> "https://www.netlify.com/privacy/"