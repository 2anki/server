const FileSaver = require('file-saver')

import ZipHandler from './handlers/ZipHandler'
import DeckHandler from './handlers/DeckHandler'
import ExpressionHelper from './handlers/ExpressionHelper'
import APKGBuilder from './handlers/APKGBuilder'

// Components
import './components/meta-section'
import './components/header'
import './components/footer'
import './components/upload-section'
import './components/preview-section'
import './components/privacy-section'
import './components/contact-section'

let progressText = ''
tag app-root

	prop state = 'ready'
	prop progress = '0'
	
	def fileuploaded event
		const files = event.target.files
		self.state = 'uploading'
		const packages = []
		console.log('files', files)
		for file in files
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(file)
			console.log("Found {zip_handler.filenames()}")
			for file_name in zip_handler.filenames()
				console.log("Reading {file_name}")
				if ExpressionHelper.markdown?(file_name)
					console.log("Building deck {file_name}")
					const deck = DeckHandler.new().build(zip_handler.files[file_name])
					const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
					packages.push({name: "{file_name}.apkg", apkg: apkg, deck})
				console.log("Done building {file_name}")

		self.packages = packages	
		// TODO: we should handle subpages / multi decks too.
		self.cards = packages[0].deck.cards
		console.log('self.cards', self.cards)
		imba.commit()
		// console.log("Preparing download from memory")


	def downloadDeck
		for pkg in self.packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		state = 'ready'

	def render
		<self>
			<n2a-header>
			<.container>
				if state == 'ready'
					<upload-section>
				elif state == 'uploading'
					<preview-section cards=self.cards>
				else		
						<p .subtilte> progressText	
				<meta-section>
				<privacy-section>
				<contact-section>
			<n2a-footer>