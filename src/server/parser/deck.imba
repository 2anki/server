import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

import AnkiExport from 'anki-apkg-export'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, TriggerNoCardsError, TriggerUnsupportedFormat} from '../constants'

String.prototype.replaceAll = do |oldValue, newValue|
	unless oldValue != newValue
		return this
	let temp = this
	let index = temp.indexOf(oldValue)
	while index != -1
		temp = temp.replace(oldValue, newValue)
		index = temp.indexOf(oldValue)
	return temp

export class DeckParser

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
		if md
			TriggerUnsupportedFormat()

		self.payload = md ? handleMarkdown(contents, deckName) : handleHTML(contents, deckName)

	def handleHTML contents, deckName = null
		const dom = cheerio.load(contents)
		let name = deckName || dom('title').text()
		let style = dom('style').html()

		const toggleList = dom(".page-body > ul").toArray()
		let cards = toggleList.map do |t|
			// We want to perserve the parent's style, so getting the class
			const parentUL = dom(t)
			const parentClass = dom(t).attr("class")

			if parentUL
				# TODO: fix details to be wrapped
				dom('details').addClass(parentClass)
				dom('summary').addClass(parentClass)
				const summary = parentUL.find('summary').first()
				const toggle = parentUL.find("details").first()
				if summary and toggle
					const toggleHTML = toggle.html()
					if toggleHTML
						let back = toggleHTML.replace(summary, "")
						return { name: summary.html(), back: back }
					else
						console.log('error in (missing valid detailts)', parentUL.html())
		# Prevent bad cards from leaking out
		cards = cards.filter(Boolean)
		console.log('cards', cards)
		cards = sanityCheck(cards)

		unless cards.length > 0
			TriggerNoCardsError()

		return {name, cards, style}

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
	def newUniqueFileName input
		var shasum = crypto.createHash('sha1')
		shasum.update(input)
		shasum.digest('hex')

	def suffix input
		return null if !input

		const m = input.match(/\.[0-9a-z]+$/i)
		return null if !m
		
		return m[0] if m
	
	def setupExporter deck
		const css = deck.style.replaceAll("'", '"')
		new AnkiExport(deck.name, {css: css})	

	def embedFile exporter, files, filePath
		console.log('embedFile', Object.keys(files), filePath)
		const suffix = self.suffix(filePath)
		return null if !suffix

		let file = files["{filePath}"]
		const newName = self.newUniqueFileName(filePath) + suffix
		exporter.addMedia(newName, file)
		return newName
	
	# https://stackoverflow.com/questions/6903823/regex-for-youtube-id
	def get_youtube_id input
		console.log('get_youtube_id', arguments)
		try
			const m =  input.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/)
			# prevent swallowing of soundcloud embeds
			if m[0].match(/https:\/\/soundcloud.com/)
				return null
			return m[1]
		catch error
				return null
	
	def get_soundcloud_url input
		console.log('get_soundcloud_url', arguments)
		try
			const sre = /https?:\/\/soundcloud\.com\/\S*/gi
			return input.match(sre)[0].split('">')[0]
		catch error
			return null

	def find_mp3_file input
		try
			const m = input.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2]
			unless m.endsWith('.mp3') and !m.startsWith('http')
				return null
			return m
		catch error
			return null

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
						if let newName = self.embedFile(exporter, files, global.decodeURIComponent(originalName))
							console.log('replacing', originalName, 'with', newName)
							# We have to replace globally since Notion can add the filename as alt value
							card.back = card.back.replaceAll(originalName, newName)
				deck.image_count += (card.back.match(/\<+\s?img/g) || []).length
			
			if let audiofile = find_mp3_file(card.back)
				if let newFileName = self.embedFile(exporter, files, global.decodeURIComponent(audiofile))
					console.log('added sound', newFileName)
					card.back += "[sound:{newFileName}]"

			# Check YouTube
			if let id = get_youtube_id(card.back)
				console.log('IDE', id)
				const ytSrc = "https://www.youtube.com/embed/{id}?".replace(/"/, '')
				const video = "<iframe width='560' height='315' src='{ytSrc}' frameborder='0' allowfullscreen></iframe>"
				card.back += video
			if let soundCloudUrl = get_soundcloud_url(card.back)
				const audio = "<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url={soundCloudUrl}'></iframe>"
				card.back += audio

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