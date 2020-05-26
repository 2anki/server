import './components/page-content'
import './components/n2a-button'

tag home-page

	prop state = 'ready'

	def clickButton
		console.log('called!')
		const button = document.getElementById('upload-button')
		button.click()
	
	def render
		<self>
			<page-content .justify-center=(state == 'uploading') .items-center=(state == 'uploading')>
				if state == 'ready'
					<div .flex .flex-col .justify-center .items-center .h-screen>
						<input .m-4 .p-4 .border-dashed .border-4 .border-gray-600 #upload-button :change.fileuploaded type="file" name="resume" accept=".zip,.html">
				elif state == 'uploading'
					<div .flex .flex-col .justify-center .items-center .h-screen>
						<h2 .text-4xl> "One moment, building your deck 👷🏾‍♀️"
				elif state == 'download'
					<div .flex .flex-col .justify-center .items-center .h-screen>
						<h3 .text-xl .p-2> "Your deck is ready to. Download it and import it into Anki"
						<n2a-button :click.downloadDeck> "Download"
