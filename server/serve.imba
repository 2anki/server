import path from 'path'

import morgan from 'morgan'
import express from 'express'

import {ALLOWED_ORIGINS} from './constants'
import {ErrorHandler} from './handlers/error'

# Server Endpoints
import {ConfigureOldEndpoints} from './routes/legacy-urls'
import * as checks from './routes/checks'
import * as version from './routes/version'
import * as upload from './routes/upload'

export def serve
	const templateDir = path.join(__dirname, "templates")
	const distDir = path.join(__dirname, "../dist")
	const app = express()

	app.use(morgan('combined'))
	app.use('/templates', express.static(templateDir))
	app.use(express.static(distDir))
	app.use('/checks', checks.default)
	app.use('/version', version.default)
	ConfigureOldEndpoints(app, distDir)
	app.use('/upload', upload.default)

	app.use do |err, req, res, next|
		ErrorHandler(res, err)

	app.use do |req, res, next|
		console.log(req.originalUrl)
		res.header("Access-Control-Allow-Origin", ALLOWED_ORIGINS.join(','))
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Disposition")
		next()

	process.on('uncaughtException') do |err, origin|
		console.log(process.stderr.fd,`Caught exception: ${err}\n Exception origin: ${origin}`)

	const port = process.env.PORT || 2020
	app.listen(port) do console.log("🟢 Running on http://localhost:{port}")