const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

// Components
import './components/header'
import './components/footer'

// Pages
import './pages/contact-page'
import './pages/home-page'
import './pages/privacy-page'

tag app-root

	prop state = 'ready'
	prop progress = '0'
	prop info = ['Ready']
	
	def fileuploaded event
		const files = event.target.files
		self.state = 'uploading'
		console.log("Read Notion file")
		const packages = []
		for file in files
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(file)
			// console.log("Found {zip_handler.filenames()}")
			for file_name in zip_handler.filenames()
				// console.log("Reading {file_name}")
				if ExpressionHelper.markdown?(file_name)
					console.log("Building deck {file_name}")
					const deck = DeckHandler.new().build(zip_handler.files[file_name])
					const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
					packages.push({name: "{file_name}.apkg", apkg: apkg, deck})
				console.log("Done building {file_name}")


		self.packages = packages	
		if packages.length > 1
			console.log('Sorry subpages are not supported yet.')
		self.cards = packages[0].deck.cards
		state = 'download'
		imba.commit()
		console.log("Preparing download from memory")


	def downloadDeck
		for pkg in self.packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		console.log('Download available')
		state = 'ready'
	
	def current-page
		const pathname = window.location.pathname
		console.log('pathname', pathname)
		pathname


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