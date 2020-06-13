const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import ExpressionHelper from './handlers/ExpressionHelper'

# Actions
import { PrepareDeck } from './actions/PrepareDeck'

# Components
import './components/header'
import './components/footer'
import './home-page'

tag app-root

	prop state = 'ready'
	prop progress = '0'
	prop info = ['Ready']

	def mount
		window.onbeforeunload = do
			if state != 'ready'
				return "Conversion in progress. Are you sure you want to stop it?"

	

	// TODO: refactor DRY
	def fileuploaded event
		try
			const files = event.target.files
			self.state = 'uploading'
			self.packages = []
			for file in files
				if file.name.match(/\.zip$/)
					const zip_handler = ZipHandler.new()
					const _ = await zip_handler.build(file)
					for file_name in zip_handler.filenames()
						if ExpressionHelper.document?(file_name)
							self.packages = await PrepareDeck(file_name, zip_handler.files)
							state = 'download'
							imba.commit()
			if packages.length == 0
				# Handle workflowy
				# TODO: add event to track how many people are using this code path
				const file = files[0]
				const file_name = file.name
				const reader = FileReader.new()
				reader.onload = do 
					self.packages = await PrepareDeck(file_name, {file_name: reader.result})
				reader.readAsText(file)

		catch e
			console.error(e)
			window.alert("Sorry something went wrong. Send this message to the developer. Error: {e.message}")		

	def downloadDeck
		try
			for pkg in self.packages
				FileSaver.saveAs(pkg.apkg, pkg.name)
		catch err
			window.alert('Sorry, something went wrong during opening. Have you allowed multi-file downloads?')
		state = 'ready'
		self.packages = []
	
	def render
		<self>
			<n2a-header>
			<home-page state=state>
			<n2a-footer>
