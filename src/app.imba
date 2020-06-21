const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'

# Actions
import { PrepareDeck } from './actions/PrepareDeck'

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
		self.state = 'uploading'
		self.packages = []
		for file in files
			if file.name.match(/\.zip$/)
				const zip_handler = ZipHandler.new()
				const _ = await zip_handler.build(file)
				for file_name in zip_handler.filenames()
					if file_name.match(/.(md|html)$/)
						self.packages = await PrepareDeck(file_name, zip_handler.files, self.settings)
						state = 'download'
						imba.commit()
		if packages.length == 0
			# Handle workflowy
			# TODO: add event to track how many people are using this code path
			const file = files[0]
			const file_name = file.name
			const reader = FileReader.new()
			reader.onload = do 
				self.packages = await PrepareDeck(file_name, [{file_name: reader.result}], self.settings)
			reader.readAsText(file)
						
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
