const fs = require('fs')

const express = require('express')

const resolvePath = require('../constants').resolvePath

const router = express.Router()

const appInfo = JSON.parse(fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString())

router.get('/', function (req, res) {
  res.status(200).send(`Notion to Anki v${appInfo.version}`)
})

exports.default = router
