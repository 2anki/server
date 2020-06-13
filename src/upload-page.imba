import './components/page-content'
import './components/n2a-button'
import './components/progress-bar'

tag upload-page

	prop state = 'ready'
	prop progress = 0
	prop fontSize = 20

	def clickButton
		const button = document.getElementById('upload-button')
		button.click()
	
	def render
		<self>
			<page-content .justify-center=(state == 'uploading') .items-center=(state == 'uploading')>				
				<div .flex .flex-col .justify-center .items-center .h-screen>
					if state == 'ready'
						<input .m-4 .p-4 .border-dashed .border-4 .border-gray-600 #upload-button :change.fileuploaded type="file" name="resume" accept=".zip,.html">
						<div .text-center>
							<h2> "Font size: {fontSize}"
							<input[fontSize] min='20' type="range" :change.fontSizeChanged(fontSize)>
							<p #user-font-size css:font-size="{fontSize}px"> "a A あ　ア　万"
					elif state == 'uploading'
						<h2 .text-4xl> "One moment, building your deck 👷🏾‍♀️"
						<progress-bar value=progress>
					elif state == 'download'
						<h3 .text-xl .p-2> "Your deck is ready to. Download it and import it into Anki"
						<n2a-button :click.downloadDeck> "Download"
