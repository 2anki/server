import DeckParser from '../DeckParser'

def isMarkdown file
	return false if !file

	file.match(/\.md$/)

// TODO: clean up duplication
export def PrepareDeck file_name, files, settings
		const decks = DeckParser.new(isMarkdown(file_name), files[file_name], settings)
		let packages = []
		if Array.isArray(decks.payload)
			for d in decks.payload
				continue if d.cards.length == 0
				const apkg = await decks.build(null, d, files)
				packages.push({name: "{d.name}.apkg", apkg: apkg, d})
			packages				
		else
			const deck = decks.payload
			const apkg = await decks.build(null, deck, files)
			packages.push({name: "{deck.name}.apkg", apkg: apkg, deck})
			packages
