const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

# Components
import './components/header'
import './components/footer'

# Pages
import './pages/contact-page'
import './pages/home-page'
import './pages/privacy-page'

tag app-root

	prop state = 'ready'
	prop progress = '0'
	prop info = ['Ready']
	
	def fileuploaded event
		try
			const files = event.target.files
			self.state = 'uploading'
			const packages = []
			for file in files
				const zip_handler = ZipHandler.new()
				const _ = await zip_handler.build(file)
				for file_name in zip_handler.filenames()
					if ExpressionHelper.document?(file_name)
						const deck = DeckHandler.new(file_name.match(/\.md$/)).build(zip_handler.files[file_name])
						const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
						packages.push({name: "{file_name}.apkg", apkg: apkg, deck})

			self.packages = packages	
			self.cards = packages[0].deck.cards
			state = 'download'
			imba.commit()
		catch e
			console.error(e)
			window.alert("Sorry something went wrong. Send this message to the developer. Error: {e.message}")

	def downloadDeck
		for pkg in self.packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		state = 'ready'
	
	def render
		<self>
			<n2a-header>
			if window.location.pathname == '/contact'
				<contact-page>
			elif window.location.pathname == '/privacy'
				<privacy-page>
			else
				<home-page state=state>
			<n2a-footer>
