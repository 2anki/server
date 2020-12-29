import path from 'path'
import fs from 'fs'

import express from 'express'

const router = express.Router!

const appInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json')).toString!)

router.get('/') do |req, res|
	const v = appInfo.version
	res.status(200).send(v)

export default router