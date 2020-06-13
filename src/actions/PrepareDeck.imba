import DeckHandler from '../handlers/DeckHandler'
import APKGBuilder from '../handlers/APKGBuilder'

export def PrepareDeck file_name, files
		const deck = DeckHandler.new(file_name.match(/\.md$/)).build(files[file_name])
		let packages = []
		if Array.isArray(deck)
			for d in deck
				continue if d.cards.length == 0
				const apkg = await APKGBuilder.new().build(null, d, files)
				packages.push({name: "{d.name}.apkg", apkg: apkg, deck})
			packages				
		else
			const apkg = await APKGBuilder.new().build(null, deck, files)
			packages.push({name: "{deck.name}.apkg", apkg: apkg, deck})
			packages
