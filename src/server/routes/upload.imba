import path from 'path'
import fs from 'fs'
import os from 'os'

import express from 'express'
import multer from 'multer'
import { nanoid } from 'nanoid'

import {DeckParser,PrepareDeck} from '../parser/deck'
import {ZipHandler} from '../handlers/zip'
import {ErrorHandler} from '../handlers/error'

import {TEMPLATE_DIR, TriggerNoCardsError, TriggerUnsupportedFormat, ALLOWED_ORIGINS} from '../config/constants'
const ADVERTISEMENT = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.html')).toString!

def handle_upload req, res
	console.log('POST', req.originalUrl)
	const origin = req.headers.origin
	const permitted = ALLOWED_ORIGINS.includes(origin)
	console.log('checking if', origin, 'is whitelisted', permitted)
	if !permitted
		return res.status(403).send()
	console.log('permitted access to', origin)
	res.set('Access-Control-Allow-Origin', origin)
	try
		const files = req.files
		let decks = []
		for file in files
			const filename = file.originalname
			const settings = req.body || {}
			const payload = file.buffer

			console.log('filename', filename, 'with settings', settings)
			if filename.match(/.html$/)
				console.log('We have a non zip upload')
				const d = await PrepareDeck(filename, {"{filename}": file.buffer.toString!}, settings)
				decks = decks.concat(d)
			elif filename.match(/.md$/)
				TriggerUnsupportedFormat!
			else
				console.log('zip upload')
				const zip_handler = new ZipHandler()
				const _ = await zip_handler.build(payload)
				for file_name in zip_handler.filenames()
					if file_name.match(/.html$/) and !file_name.includes('/')
						console.log('21 21 21 detected payload', file_name)
						const d = await PrepareDeck(file_name, zip_handler.files, settings)
						decks.push(d)
					elif file_name.match(/.md$/)
						TriggerUnsupportedFormat!

		let payload
		let pname
		let plen
		if decks.length == 1
			let deck = decks[0]
			payload = deck.apkg
			plen = Buffer.byteLength(deck.apkg)
			pname = "{deck.name}.apkg"
			res.set("Content-Type", "application/apkg")
			res.set("Content-Length": plen)
			res.attachment("/"+pname)
			res.status(200).send(payload)
		elif decks.length > 1
			const pkg = path.join(os.tmpdir(), "Your decks-{nanoid()}.zip")
			payload = await ZipHandler.toZip(decks, ADVERTISEMENT)
			fs.writeFileSync(pkg, payload)
			res.download(pkg)
		else
			TriggerNoCardsError()
		# TODO: Schedule deletion?
	catch err
		console.error(err)
		ErrorHandler(res, err)

const router = express.Router!
var m = multer({ storage: multer.memoryStorage() })
router.post('/', m.array('pakker')) do |req, res|
	console.log(',,sks')
	handle_upload(req, res)

export default router