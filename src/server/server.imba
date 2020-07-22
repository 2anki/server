import path from 'path'
import fs from 'fs'

import express from 'express'
import multer from 'multer'
import cors from 'cors'

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

app.use(cors())

const distDir = path.join(__dirname, "../../dist")

app.use(express.static(distDir))

const appInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')).toString!)

app.get('/checks') do $2.status(200).send('Notion 2 Anki')
app.get('/version') do |req, res|
	const v = appInfo.version
	res.status(200).send(v)

const old = ['/index', '/contact', '/privacy', '/upload', '/faq']
for p in old
	console.log('setting up request handler for ', p)
	app.get (p) do |req, res| res.sendFile(path.join(distDir, 'index.html'))
	app.get ("{p}.html") do |req, res| res.sendFile(path.join(distDir, 'index.html'))

app.use do |err, req, res, next|
	useErrorHandler(res, err)

# TODO: Use security policy that only allows notion.2anki.com to use the upload handler
app.post('/f/upload', upload.single('pkg'), &) do |req, res|
	console.log('POST', req.originalUrl)
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
					# TODO: add support for merging multiple files into one deck
					# break
						
		res.set("Content-Type", "application/zip")
		res.set("Content-Length": Buffer.byteLength(deck.apkg))		
		res.attachment(deck.name)
		res.status(200).send(deck.apkg)
	catch err
		console.error(err)
		useErrorHandler(res, err)

process.on('uncaughtException') do |err, origin|
	console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

const port = process.env.PORT || 2020
const server = app.listen(port) do
	console.log("🟢 Running on port {port}")
