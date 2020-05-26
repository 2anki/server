const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

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

	def prepare_deck file_name, files
		const deck = DeckHandler.new(file_name.match(/\.md$/)).build(files[file_name])
		if Array.isArray(deck)
			for d in deck
				continue if d.cards.length == 0
				const apkg = await APKGBuilder.new().build(null, d, files)
				self.packages.push({name: "{d.name}.apkg", apkg: apkg, deck})
		else
				const apkg = await APKGBuilder.new().build(null, deck, files)
				self.packages.push({name: "{files[0]}.apkg", apkg: apkg, deck})
		state = 'download'
		imba.commit()

	// TODO: refactor DRY
	def fileuploaded event
		try
			const files = event.target.files
			self.state = 'uploading'
			self.packages = []
			for file in files
				console.log('file', file)
				if file.name.match(/\.zip$/)
					const zip_handler = ZipHandler.new()
					const _ = await zip_handler.build(file)
					for file_name in zip_handler.filenames()
						if ExpressionHelper.document?(file_name)
							await self.prepare_deck(file_name, zip_handler.files)
			if packages.length == 0
				# Handle workflowy
				const file = files[0]
				const file_name = file.name
				console.log(file.toString())
				const reader = FileReader.new()
				reader.onload = do 
					await self.prepare_deck(file_name, {file_name: reader.result})
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
