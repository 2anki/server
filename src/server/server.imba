import path from 'path'
import fs from 'fs'
import os from 'os'

import { nanoid } from 'nanoid'
import express from 'express'
import multer from 'multer'

import {DeckParser,PrepareDeck} from './parser/deck'
import {TEMPLATE_DIR, TriggerNoCardsError} from './constants'
import {ZipHandler} from './files/zip'

const errorPage = fs.readFileSync(path.join(TEMPLATE_DIR, 'error-message.html')).toString!
const ADVERTISEMENT = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.txt')).toString!

def useErrorHandler res, err
	res.set('Content-Type', 'text/html');
	let info = errorPage.replace('{err.message}', err.message).replace('{err?.stack}', err.stack)
	res.status(400).send(new Buffer(info))

var upload = multer({ storage: multer.memoryStorage() })
const app = express()

const distDir = path.join(__dirname, "../../dist")

app.use(express.static(distDir))

const appInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString!)

app.get('/checks') do $2.status(200).send('Notion 2 Anki')
app.get('/version') do |req, res|
	const v = appInfo.version
	res.status(200).send(v)

const old = ['/notion', '/index', '/contact', '/privacy', '/upload', '/faq', '/benefits', '/useful-links', '/links']
for p in old
	console.log('setting up request handler for ', p)
	app.get (p) do |req, res| res.sendFile(path.join(distDir, 'index.html'))
	app.get ("{p}.html") do |req, res| res.sendFile(path.join(distDir, 'index.html'))

app.use do |err, req, res, next|
	useErrorHandler(res, err)

const allowed = [
		'http://localhost:8080'
		'http://localhost:2020'
		'https://dev.notion2anki.alemayhu.com'
		'https://dev.2anki.net'
		'https://notion.2anki.com'
		'https://2anki.net',
		'https://2anki.com',
		'https://notion.2anki.net',
		'https://dev.notion.2anki.net',
		'https://notion.2anki.net/'
]

app.use do |req, res, next|
	res.header("Access-Control-Allow-Origin", allowed.join(','))
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Disposition")
	next()

def TriggerUnsupportedFormat
	throw new Error ("Markdown is not supported. Please export your Notion page as HTML.")


def handle_upload req, res
	console.log('POST', req.originalUrl)
	const origin = req.headers.origin
	const permitted = allowed.includes(origin)
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
				TriggerUnsupportedFormat()
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
						TriggerUnsupportedFormat()

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
		useErrorHandler(res, err)

app.post('/upload', upload.array('pakker'), &) do |req, res|
	handle_upload(req, res)

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

const port = process.env.PORT || 2020
const server = app.listen(port) do
	console.log("🟢 Running on http://localhost:{port}")