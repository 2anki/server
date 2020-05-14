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

tag app-root

	prop state = 'ready'
	prop progress = '0'
	prop info = ['Ready']
	
	def fileuploaded event
		const files = event.target.files
		self.state = 'uploading'
		info.push("Read Notion file")
		const packages = []
		for file in files
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(file)
			// info.push("Found {zip_handler.filenames()}")
			for file_name in zip_handler.filenames()
				// info.push("Reading {file_name}")
				if ExpressionHelper.markdown?(file_name)
					info.push("Building deck {file_name}")
					const deck = DeckHandler.new().build(zip_handler.files[file_name])
					const apkg = await APKGBuilder.new().build(null, deck, zip_handler.files)
					packages.push({name: "{file_name}.apkg", apkg: apkg, deck})
				info.push("Done building {file_name}")

		self.packages = packages	
		if packages.length > 1
			info.push('Sorry subpages are not supported yet.')
		self.cards = packages[0].deck.cards
		imba.commit()
		info.push("Preparing download from memory")


	def downloadDeck
		for pkg in self.packages
			FileSaver.saveAs(pkg.apkg, pkg.name)
		info.push('Download available')
		state = 'ready'

	def render
		<self>
			<n2a-header>
			<.container>
				if state == 'ready'
					<upload-section>
				elif state == 'uploading'
					// <ul .p-4 .flex .flex-col .justify-center .items-center> for l in info
					// 	<li> "✅ {l}"
					<preview-section cards=self.cards>
				<meta-section>
				<privacy-section>
				<contact-section>
			<n2a-footer>