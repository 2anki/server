import path from 'path'
import fs from 'fs'

import express from 'express'
import multer from 'multer'

import {DeckParser,PrepareDeck} from './parser/deck'
import {TEMPLATE_DIR} from './constants'
import {ZipHandler} from './files/zip'

const errorPage = fs.readFileSync(path.join(TEMPLATE_DIR, 'error-message.html')).toString!

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

const old = ['/notion', '/index', '/contact', '/privacy', '/upload', '/faq', '/features', '/useful-links', '/links']
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
		'https://dev.notion.2anki.net'
		'https://notion.2anki.com'
		'https://notion.2anki.net'
]

app.use do |req, res, next|
	res.header("Access-Control-Allow-Origin", allowed.join(','))
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Deck-Name")
	next()


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
		const filename = req.file.originalname		
		const settings = req.body || {}
		const payload = req.file.buffer
		let deck

		console.log('filename', filename, 'with settings', settings)
		if filename.match(/.(md|html)$/)
			console.log('We have a non zip upload')
			deck = await PrepareDeck(filename, {"{filename}": req.file.buffer.toString!}, settings)
		else
			console.log('zip upload')
			const zip_handler = ZipHandler.new()
			const _ = await zip_handler.build(payload)
			for file_name in zip_handler.filenames()
				if file_name.match(/.(md|html)$/)
					deck = await PrepareDeck(file_name, zip_handler.files, settings)
						
		res.set("Content-Type", "application/zip")
		res.set("Content-Length": Buffer.byteLength(deck.apkg))		
		res.attachment(deck.name)
		res.status(200).send(deck.apkg)
		# TODO: Schedule deletion?
		console.log('x settings', settings)
	catch err
		console.error(err)
		useErrorHandler(res, err)

app.post('/f/upload', upload.single('pkg'), &) do |req, res|
	handle_upload(req, res)

app.post('/f-dev/upload', upload.single('pkg'), &) do |req, res|
	handle_upload(req, res)

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

const port = process.env.PORT || 2020
const server = app.listen(port) do
	console.log("🟢 Running on http://localhost:{port}")
