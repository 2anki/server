import '../components/page-content'
import '../components/n2a-button'
import '../components/progress-bar'

tag upload-page

	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20
	prop autoplay = true

	css .cta bg: #83C9F5 c: white fw: bold
	
	def isDebug
		window.location.hostname == 'localhost'

	def baseUrl
		switch window.location.hostname
			when 'localhost'
				return "http://localhost:2020"
			when 'dev.notion2anki.alemayhu.com' or 'dev.notion.2anki.net'
				return "https://dev.notion.2anki.net"
			else
				"https://notion.2anki.com"

	def actionUrl
		"{baseUrl()}/f/upload"

	def render
		<self>
			<.section>
				<.container>
					<h1.title> "Pick your options"
					<hr>
					<p.subtitle> "Only the zip or HTML file is required. Please use the exported ZIP file to get all your images."
					<form enctype="multipart/form-data" method="post" action=actionUrl()>
						<h3 .title .is-3> "Deck Name" 
						<input.input[w: 90% min-height: 48px fs: 2xl fw: bold c: #83C9F5 @placeholder: grey] placeholder="Enter deck name (optional)" name="deckName" type="text">
						<h3[mt: 2rem] .title .is-3> "Card Types" 
						<div[mt: 1rem].control.has-icons-left>
							<div.select.is-large>
								<.select>
									<select name="flip-mode">
										<option value="basic"> "Basic front and back"
										<option value="basic-reversed"> "Basic and reversed"
										<option value="reversed"> "Just the reversed"
							<span.icon.is-large.is-left>
								<i.fas.fa-chalkboard>
						<h3[mt: 2rem] .title .is-3> "Media Options" 
							<p.has-text-centered .subtitle> "Coming soon"

						<h3[mt: 2rem] .title .is-3> "Notion Export File"
						<p.subtitle[mt: 1rem]> "Not sure how to export? See this tutorial {<a target='_blank' href="https://youtu.be/b3eQ0exhdz4"> "Video Tutorial: Creating Anki Decks from Notion Toggle Lists"}."
						<div.field>
							<div.file.is-centered.is-boxed.is-success.has-name>
								<label.file-label>
									<input.file-input type="file" name="pkg" accept=".zip,.html,.md" required>
									<span.file-cta>
										<span.file-icon>
											<i.fas.fa-upload>
										<span.file-label> "Centered file…"
									<span.file-name> "My Notion Export.zip"
						<.has-text-centered>
							<button[mt: 2rem].button.cta .is-large type="submit"> "Convert"

			<.section>
				<.container>
					<div[m:4rem]>
						<p.subtitle> "If you are missing a feature or format, let me know on {<a href="https://github.com/alemayhu/notion2anki"> "GitHub"} or the {<a href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"}"													