# TODO: drop the file-save dependency by using a temporary blob url?
const FileSaver = require('file-saver')

# Components
import './components/header'
import './components/footer'
import './upload-page'

tag app-root

	prop state = 'ready'
	prop progress = 0
	prop info = ['Ready']
	# TODO: expose more card template stuff
	prop settings = {'font-size': 20}

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"

	def fontSizeChanged fontSize
		self.settings['font-size'] = fontSize

	// TODO: refactor DRY
	def fileuploaded event
		const files = event.target.files
		console.log('files', files)
		self.state = 'uploading'
		self.packages = []
						
	def downloadDeck
		for pkg in self.packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		state = 'ready'
		self.packages = []
		self.progress = 0
	
	def render
		<self>
			<n2a-header>
			<p .(py: 2 text-align: center bg: whitesmoke)> 
				"Join the Community on "
				<a .(background: #7289da px: 2 text: white) .rounded .mr-4 href="https://discord.gg/PSKC3uS" target="_blank"> "Discord"
			<upload-page state=state progress=progress>
			<n2a-footer>
