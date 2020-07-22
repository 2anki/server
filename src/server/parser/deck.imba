import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

import AnkiExport from 'anki-apkg-export'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, TriggerNoCardsError, TriggerUnsupportedFormat} from '../constants'

export class DeckParser

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
		if md
			TriggerUnsupportedFormat()

		self.payload = md ? handleMarkdown(contents, deckName) : handleHTML(contents, deckName)

	def pickDefaultDeckName firstLine
		const name = firstLine ? firstLine.trim() : 'Untitled Deck'
		firstLine.trim().replace(/^# /, '')

	def handleHTML contents, deckName = null
		const dom = cheerio.load(contents)
		let name = deckName || dom('title').text()
		let style = /<style[^>]*>([^<]+)<\/style>/i.exec(contents)[1]

		const toggleList = dom(".page-body > ul").toArray()
		let cards = toggleList.map do |t|
			// We want to perserve the parent's style, so getting the class
			const parentUL = dom(t)
			const toggle = parentUL.find("details").html()
			if toggle
				const summaryMatch = toggle.match(/<\s*summary[^>]*>(.*?)<\s*\/\s*summary>/)
				if summaryMatch
					const front = summaryMatch[0]
					let back = toggle.replace(front, "")
					return { name: front, back: back }
		# Prevent bad cards from leaking out
		cards = cards.filter(Boolean)
		console.log('cards', cards)
		cards = sanityCheck(cards)
		if cards.length > 0
			return {name, cards, style}
		TriggerNoCardsError()

	def sanityCheck cards
		let empty = cards.find do |x|
			if !x
				console.log 'broken card'
			if !x.name
				console.log('card is missing name')
			if !x.back
				console.log('card is missing back')
			!x  or !x.name or !x.back
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')
			console.log('cards', cards)
		cards.filter do $1.name and $1.back

	// Try to avoid name conflicts and invalid characters by hashing
	def newImageName input
		var shasum = crypto.createHash('sha1')
		shasum.update(input)
		shasum.digest('hex')

	def suffix input
		return null if !input

		const m = input.match(/\.[0-9a-z]+$/i)
		return null if !m
		
		return m[0] if m
	
	def setupExporter deck
		const css = self.replaceAll("'", '"', deck.style)
		new AnkiExport(deck.name, {css: css})	

	def embedImage exporter, files, imagePath
		const suffix = self.suffix(imagePath)
		return null if !suffix

		let image = files["{imagePath}"]
		const newName = self.newImageName(imagePath) + suffix
		exporter.addMedia(newName, image)
		return newName
	
	def replaceAll original, changed, input
		const re = new RegExp(original, 'g')
		input.replace(re, changed)


	def build output, deck, files
		console.log('building deck')
		let exporter = self.setupExporter(deck)		
		const card_count = deck.cards.length
		deck.image_count = 0

		for card in deck.cards
			console.log("exporting {deck.name} {deck.cards.indexOf(card)} / {card_count}")
			const dom = cheerio.load(card.back)
			const images = dom('img')
			if images.length > 0
				console.log('Number of images', images.length)
				const oldNames = []
				images.each do |i, elem|
					const originalName = dom(elem).attr('src')
					if !originalName.startsWith('http')						
						if let newName = self.embedImage(exporter, files, global.decodeURIComponent(originalName))
							console.log('replacing', originalName, 'with', newName)
							# We have to replace globally since Notion can add the filename as alt value
							card.back = self.replaceAll(originalName, newName, card.back)
				deck.image_count += (card.back.match(/\<+\s?img/g) || []).length
			
			# Check YouTube
			const ytRe = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
			const ytMatch = card.back.match(ytRe)
			if ytMatch && ytMatch.length > 2
				const id = ytMatch[2].split('<')[0]
				if id
					const video = "<iframe width='560' height='315' src='https://www.youtube.com/embed/{id}' frameborder='0' allowfullscreen></iframe>"
					card.back += video

			const tags = card.tags ? {tags: card.tags} : {}
			const flipMode = self.settings['flip-mode']
			switch flipMode
				when 'Basic and reversed' or 'basic-reversed'
					exporter.addCard(card.name, card.back, tags)
					exporter.addCard(card.back, card.name, tags)
				when 'Just the reversed' or 'reversed'
					exporter.addCard(card.back, card.name, tags)
				else
					exporter.addCard(card.name, card.back, tags)

		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');			

export def PrepareDeck file_name, files, settings
		const decks = DeckParser.new(file_name.match(/.md$/), files[file_name], settings)
		const deck = decks.payload
		const apkg = await decks.build(null, deck, files)
		{name: "{deck.name}.apkg", apkg: apkg, deck: deck}