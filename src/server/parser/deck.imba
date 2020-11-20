import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import os from 'os'

import { nanoid, customAlphabet } from 'nanoid'
import cheerio from 'cheerio'

import {TEMPLATE_DIR, TriggerNoCardsError, TriggerUnsupportedFormat} from '../constants'
import CardGenerator from '../service/generator'

String.prototype.replaceAll = do |oldValue, newValue|
	unless oldValue != newValue
		return this
	let temp = this
	let index = temp.indexOf(oldValue)
	while index != -1
		temp = temp.replace(oldValue, newValue)
		index = temp.indexOf(oldValue)
	return temp

class CustomExporter

	prop first_deck_name
	prop workspace
	prop media

	def constructor first_deck_name, workspace
		self.first_deck_name = first_deck_name.replace('.html', '')
		self.workspace = workspace
		self.media ||= []

	def addMedia newName, file
		const abs = path.join(self.workspace, newName)
		self.media.push(abs)
		fs.writeFileSync(abs, file)
	
	def addCard back, tags
		self

	def configure payload
		const payload_info = path.join(self.workspace, 'deck_info.json')		
		fs.writeFileSync(payload_info, JSON.stringify(payload, null, 2))

	def save
		const gen = new CardGenerator(self.workspace)
		const payload = await gen.run()
		return fs.readFileSync(payload)

export class DeckParser

	prop ga

	get name do self.payload[0].name

	def constructor file_name, settings = {}, files
		const deckName = settings.deckName
		const contents = files[file_name]
		self.settings = settings
		self.use_input = self.enable_input!
		self.use_cloze = self.is_cloze!
		self.image = null
		self.files = files || []
		self.first_deck_name = file_name
		self.payload = handleHTML(file_name, contents, deckName)

	def find_next_page href, file_name
		let next_file_name = global.decodeURIComponent(href)
		let pageContent = self.files[next_file_name]
		const match = Object.keys(self.files).find do $1.match(next_file_name)
		if match
			return self.files[match]
		return pageContent
					
	def handleHTML file_name, contents, deckName = null, decks = []
		const dom = cheerio.load(contents)
		let name = deckName || dom('title').text()
		let style = dom('style').html()
		style = style.replace(/white-space: pre-wrap;/g, '')
		const isCherry = settings['cherry'] != 'false'
		let image = null
		
		const fs = self.settings['font-size']
		if fs and fs != '20px'
			# TODO: check if fs already has suffix 'px'
			style += '\n' + '* { font-size:' + self.settings['font-size'] + 'px}'

		let pageCoverImage = dom('.page-cover-image')
		if pageCoverImage
			image = pageCoverImage.attr('src')

		let pageIcon = dom('.icon')
		if let pi = pageIcon.html()
			if !name.includes(pi) and decks.length == 0
				if !name.includes('::') and !name.startsWith(pi)
					name = "{pi} {name}"
				else
					const names = name.split(/::/)
					const end = names.length - 1
					const last = names[end]
					names[end] = "{pi} {last}"
					name = names.join("::")
		const toggleList = dom(isCherry ? ".toggle" : ".page-body > ul").toArray()
		let cards = toggleList.map do |t|
			// We want to perserve the parent's style, so getting the class
			const parentUL = dom(t)
			const parentClass = dom(t).attr("class")

			const toggleMode = self.settings['toggle-mode']
			if toggleMode == 'open_toggle'
				dom('details').attr('open', '')							
			elif toggleMode == 'close_toggle'							
				dom('details').removeAttr('open')
			
			if parentUL
				dom('details').addClass(parentClass)
				dom('summary').addClass(parentClass)
				const summary = parentUL.find('summary').first()
				const toggle = parentUL.find("details").first()
				if summary and toggle
					const toggleHTML = toggle.html()
					if toggleHTML
						const n = parentClass ? "<div class='{parentClass}'>{summary.html()}</div>" : summary.html()
						const b = toggleHTML.replace(summary, "")
						const note = { name: n, back: b }
						const cherry = '&#x1F352;' # 🍒
						if isCherry and !note.name.includes(cherry) and !note.back.includes(cherry)
							return null
						else
							return note												
		# Prevent bad cards from leaking out
		cards = cards.filter(Boolean)
		cards = sanityCheck(cards)

		decks.push({name: name, cards: cards, image: image, style: style, id: self.generate_id!})

		# unless cards.length > 0
		# 	TriggerNoCardsError()
		const subpages = dom(".link-to-page").toArray()
		for page in subpages
			const spDom = dom(page)
			const ref = spDom.find('a').first()
			const href = ref.attr('href')
			if let pageContent = self.find_next_page(href, file_name)
				const subDeckName = spDom.find('title').text() || ref.text()
				self.handleHTML(file_name, pageContent, "{name}::{subDeckName}", decks)

		return decks

	def has_cloze_deletions input
		return false if !input

		input.includes('code')

	def valid_input_card input
		return false if !self.enable_input()
		input.name and input.name.includes('strong')		

	def sanityCheck cards
		let empty = cards.find do |x|
			if !x.back
				return has_cloze_deletions(x.name)
			!x  or !x.name or !x.back
		cards.filter do |c|
			c.name and (has_cloze_deletions(c.name) or c.back or valid_input_card(c))

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
		fs.mkdirSync(workspace)
		fs.writeFileSync(path.join(workspace, 'deck_style.css'), css)
		return new CustomExporter(self.first_deck_name, workspace)

	def embedFile exporter, files, filePath
		const suffix = self.suffix(filePath)
		return null if !suffix
		let file = files["{filePath}"]
		if !file
			file = files["{exporter.first_deck_name}/{filePath}"]
			if !file
				throw new Error("Missing relative path to {filePath} used {exporter.first_deck_name}")
		const newName = self.newUniqueFileName(filePath) + suffix
		exporter.addMedia(newName, file)
		return newName
	
	# https://stackoverflow.com/questions/6903823/regex-for-youtube-id
	def get_youtube_id input
		try
			const m =  input.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/)
			# prevent swallowing of soundcloud embeds
			if m[0].match(/https:\/\/soundcloud.com/)
				return null
			return m[1]
		catch error
				return null
	
	def get_soundcloud_url input
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
		const numbers = [ 
			'1&#xFE0F;&#x20E3;', # 1️⃣
			'2&#xFE0F;&#x20E3;', # 2️⃣
			'3&#xFE0F;&#x20E3;', # 3️⃣
			'4&#xFE0F;&#x20E3;', # 4️⃣ 
			'5&#xFE0F;&#x20E3;', # 5️⃣ 
			'6&#xFE0F;&#x20E3;', # 6️⃣
			'7&#xFE0F;&#x20E3;', # 7️⃣
			'8&#xFE0F;&#x20E3;', # 8️⃣
			'9&#xFE0F;&#x20E3;', # 9️⃣
			'&#x1F51F;' # 🔟
		]
		clozeDeletions.each do |i, elem|
			const v = dom(elem).html()
			let used_index = false
			for num of numbers
				const old = "{num}<code>{v}</code>"
				const newValue = '{{c'+(numbers.indexOf(num)+1)+'::'+v+'}}'
				if mangle.match(old)
					used_index = true
				mangle = mangle.replaceAll(old, newValue)
			if not used_index
				const old = "<code>{v}</code>"
				const newValue = '{{c'+(i+1)+'::'+v+'}}'
				mangle = mangle.replaceAll(old, newValue)		

		mangle

	def treatBoldAsInput input, inline=false
		const dom = cheerio.load(input)
		const underlines = dom('strong')
		let mangle = input
		let answer = ''
		underlines.each do |i, elem|
			const v = dom(elem).html()
			const old = "<strong>{v}</strong>"
			mangle = mangle.replaceAll(old, inline ? v : '{{type:Input}}')
			answer = v
		{mangle: mangle, answer: answer}

	def is_cloze
		self.settings['cloze'] != 'false'
	
	def enable_input
		self.settings['enable-input'] != 'false'

	def generate_id
		return parseInt(customAlphabet('1234567890', 16)())

	def locate_tags card
		let input = [card.name, card.back]

		for i in input
			continue if not i

			const dom = cheerio.load(i)
			const deletions = dom('del')
			
			deletions.each do |i, elem|
				const del = dom(elem)
				card.tags = del.text().split(',').map do $1.trim().replace(/\s/g, '-')
				card.back = card.back.replaceAll(del.html(), '')
				card.name = card.name.replaceAll(del.html(), '')
		return card

	def build
		const workspace = path.join(os.tmpdir(), nanoid())
		let exporter = self.setupExporter(self.payload[0], workspace)
	
		for deck in self.payload
			deck['empty-deck-desc'] = self.settings['empty-deck-desc'] != 'false'
			const card_count = deck.cards.length
			deck.image_count = 0

			deck.card_count = card_count
			deck.id = self.generate_id!
			delete deck.style

			# Counter for perserving the order in Anki deck.
			let counter = 0
			const addThese = []
			for card in deck.cards
				card['enable-input'] = self.settings['enable-input'] != 'false'
				card.number = counter++
				if self.use_cloze
					card.name = self.handleClozeDeletions(card.name)
				if self.use_input && card.name.includes('<strong>')
					let inputInfo = self.treatBoldAsInput(card.name)
					card.name = inputInfo.mangle
					card.answer = inputInfo.answer

				card.media = []
				if card.back
					const dom = cheerio.load(card.back)
					const images = dom('img')
					if images.length > 0
						images.each do |i, elem|
							const originalName = dom(elem).attr('src')
							if !originalName.startsWith('http')						
								if let newName = self.embedFile(exporter, self.files, global.decodeURIComponent(originalName))
									dom(elem).attr('src', newName)
									card.media.push(newName)						
						deck.image_count += (card.back.match(/\<+\s?img/g) || []).length
						card.back = dom.html()
					
					if let audiofile = find_mp3_file(card.back)
						if let newFileName = self.embedFile(exporter, self.files, global.decodeURIComponent(audiofile))
							card.back += "[sound:{newFileName}]"
							card.media.push(newFileName)

					# Check YouTube
					if let id = get_youtube_id(card.back)
						const ytSrc = "https://www.youtube.com/embed/{id}?".replace(/"/, '')
						const video = "<iframe width='560' height='315' src='{ytSrc}' frameborder='0' allowfullscreen></iframe>"
						card.back += video
					if let soundCloudUrl = get_soundcloud_url(card.back)
						const audio = "<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url={soundCloudUrl}'></iframe>"
						card.back += audio

					if self.use_cloze
						# TODO: investigate why cloze deletions are not handled properly on the back / extra
						card.back = self.handleClozeDeletions(card.back)
					if self.use_input and card.back.includes('<strong>')
						let inputInfo = self.treatBoldAsInput(card.back, true)
						card.back = inputInfo.mangle

				card.tags ||= []
				if self.settings['tags'] != 'false'
					card = self.locate_tags(card)

				if self.settings['basic-reversed'] != 'false'
						addThese.push({name: card.back, back: card.name, tags: card.tags, media: card.media, number: counter++})
				if self.settings['reversed'] != 'false'
					const tmp = card.back
					card.back = card.name
					card.name = tmp
			deck.cards = deck.cards.concat(addThese)

		self.payload[0].cloze_model_name = self.settings.cloze_model_name
		self.payload[0].basic_model_name = self.settings.basic_model_name
		self.payload[0].input_model_name = self.settings.input_model_name
		self.payload[0].cloze_model_id = self.settings.cloze_model_id
		self.payload[0].basic_model_id = self.settings.basic_model_id
		self.payload[0].input_model_id = self.settings.input_model_id
		self.payload[0].template = self.settings.template

		exporter.configure(self.payload)
		exporter.save()

export def PrepareDeck file_name, files, settings
		const parser = new DeckParser(file_name, settings, files)
		const apkg = await parser.build()
		# TODO: rename decks below to something more sensible
		{name: "{parser.name}.apkg", apkg: apkg, deck: parser.payload}
