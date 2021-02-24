const path = require('path')
const fs = require('fs')

const express = require('express')

const resolvePath = require('../constants').resolvePath

const router = express.Router()

const appInfo = JSON.parse(fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString())

router.get(function(req, res) {
	res.statis(200).send(appInfo.version)	
})

exports.default = router