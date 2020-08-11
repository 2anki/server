import {execFile} from 'child_process'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import os from 'os'

import { customAlphabet, nanoid } from 'nanoid'
import AnkiExport from 'anki-apkg-export'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, TriggerNoCardsError, TriggerUnsupportedFormat} from '../constants'

String.prototype.replaceAll = do |oldValue, newValue|
	console.log('replaceAll', oldValue, newValue)
	unless oldValue != newValue
		return this
	let temp = this
	let index = temp.indexOf(oldValue)
	while index != -1
		temp = temp.replace(oldValue, newValue)
		index = temp.indexOf(oldValue)
	return temp

class CustomExporter

	prop workspace
	prop deck
	
	def constructor deck, workspace
		self.workspace = workspace
		self.deck = deck
		self.deck.media ||= []

	def addMedia newName, file
		const abs = path.join(self.workspace, newName)
		self.deck.media.push(abs)
		fs.writeFileSync(abs, file)
	
	def addCard back, tags
		console.log('addCard', arguments)

	def run cmd, input_args
		console.log('run', arguments)
		Promise.new do |resolve, reject|
			execFile(cmd, input_args, {cwd: self.workspace}) do |err, stdout, stderr|
				if err
					console.log('stderr::', stderr)
					console.error(err)
					reject(err)
				else
					console.log('status from create_cloze', stdout)
					resolve(stdout)

	def generate_id
		const nid = customAlphabet('1234567890', 16)
		nid()

	def prepareSave cards
		const payload_info = path.join(self.workspace, 'deck_info.json')
		self.deck.cards = cards

		console.log('writing payload', payload_info)
		fs.writeFileSync(payload_info, JSON.stringify(self.deck, null, 2))

	def save
		const python = '/usr/bin/python3'
		let cc_script_args = [
			path.join(__dirname, '../../genanki/create_cloze.py')
			path.join(self.workspace, 'deck_info.json')
			self.generate_id!,
			path.join(self.workspace, 'deck_style.css')
		]
		const z = await run(python, cc_script_args)
		return fs.readFileSync(z)

export class DeckParser

	def constructor md, contents, settings = {}
		const deckName = settings.deckName
		self.settings = settings
		self.settings['font-size'] = self.settings['font-size'] + 'px'
		self.use_cloze = self.is_cloze!
		if md
			TriggerUnsupportedFormat()
		self.payload = handleHTML(contents, deckName)

	def handleHTML contents, deckName = null
		const dom = cheerio.load(contents)
		let name = deckName || dom('title').text()
		let style = dom('style').html()
		style += '\n' + '* { font-size:' + self.settings['font-size'] + '}'

		const toggleList = dom(".page-body > ul").toArray()
		let cards = toggleList.map do |t|
			// We want to perserve the parent's style, so getting the class
			const parentUL = dom(t)
			const parentClass = dom(t).attr("class")

			if parentUL
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

	def has_cloze_deletions input
		return false if !input

		input.includes('code')

	def sanityCheck cards
		let empty = cards.find do |x|
			if !x
				console.log 'broken card'
			if !x.name
				console.log('card is missing name')
			if !x.back
				console.log('card is missing back')
				return has_cloze_deletions(x.name)
			!x  or !x.name or !x.back
		if empty
			console.log('warn Detected empty card, please report bug to developer with an example')
			console.log('cards', cards)
		cards.filter do |c|
			c.name and (has_cloze_deletions(c.name) or c.back)

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
	
	def setupExporter deck, workspace
		const css = deck.style.replaceAll("'", '"')
		if self.use_cloze
			console.log('creating workspace', workspace)
			fs.mkdirSync(workspace)
			fs.writeFileSync(path.join(workspace, 'deck_style.css'), css)
			return new CustomExporter(deck, workspace)
		return new AnkiExport(deck.name, {css: css})	

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

	def handleClozeDeletions input
		const dom = cheerio.load(input)
		const clozeDeletions = dom('code')
		let mangle = input

		clozeDeletions.each do |i, elem|
			const v = dom(elem).html()
			const old = "<code>{v}</code>"
			const newValue = '{{c'+(i+1)+'::'+v+'}}'
			mangle = mangle.replaceAll(old, newValue)		
		mangle

	def is_cloze
		return true if self.settings['card-type'] == "Cloze deletion" 
		return true if self.settings['card-type'] == 'cloze'
		return false

	def build output, deck, files
		console.log('building deck')
		const workspace = path.join(os.tmpdir(), nanoid())
		let exporter = self.setupExporter(deck, workspace)		
		const card_count = deck.cards.length
		deck.image_count = 0
		deck.card_type = self.settings['card-type']

		for card in deck.cards
			console.log("exporting {deck.name} {deck.cards.indexOf(card)} / {card_count}")
			if self.use_cloze
				card.name = self.handleClozeDeletions(card.name)

			card.media = []
			if card.back
				const dom = cheerio.load(card.back)
				const images = dom('img')
				if images.length > 0
					console.log('Number of images', images.length)
					images.each do |i, elem|
						const originalName = dom(elem).attr('src')
						if !originalName.startsWith('http')						
							if let newName = self.embedFile(exporter, files, global.decodeURIComponent(originalName))
								# We have to replace globally since Notion can add the filename as alt value
								card.back = card.back.replaceAll(originalName, newName)
								card.media.push(newName)
					deck.image_count += (card.back.match(/\<+\s?img/g) || []).length
				
				if let audiofile = find_mp3_file(card.back)
					if let newFileName = self.embedFile(exporter, files, global.decodeURIComponent(audiofile))
						console.log('added sound', newFileName)
						card.back += "[sound:{newFileName}]"
						card.media.push(newFileName)

				# Check YouTube
				if let id = get_youtube_id(card.back)
					console.log('IDE', id)
					const ytSrc = "https://www.youtube.com/embed/{id}?".replace(/"/, '')
					const video = "<iframe width='560' height='315' src='{ytSrc}' frameborder='0' allowfullscreen></iframe>"
					card.back += video
				if let soundCloudUrl = get_soundcloud_url(card.back)
					const audio = "<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url={soundCloudUrl}'></iframe>"
					card.back += audio

				if self.use_cloze
					# TODO: investigate why cloze deletions are not handled properly on the back / extra
					card.back = self.handleClozeDeletions(card.back)

			const tags = card.tags ? {tags: card.tags} : {}
			const cardType = self.settings['card-type']
			switch cardType
				when 'Basic and reversed' or 'basic-reversed'
					exporter.addCard(card.name, card.back, tags)
					exporter.addCard(card.back, card.name, tags)
				when 'Just the reversed' or 'reversed'
					exporter.addCard(card.back, card.name, tags)
				else
					exporter.addCard(card.name, card.back, tags)

		if self.use_cloze
			exporter.prepareSave(deck.cards)

		const zip = await exporter.save()
		return zip if not output
		// This code path will normally only run during local testing
		fs.writeFileSync(output, zip, 'binary');			

export def PrepareDeck file_name, files, settings
		const decks = DeckParser.new(file_name.match(/.md$/), files[file_name], settings)
		const deck = decks.payload
		const apkg = await decks.build(null, deck, files)
		{name: "{deck.name}.apkg", apkg: apkg, deck: deck}