const express = require('express')

const router = express.Router()

router.get('/', (req, res) => { res.status(200).send('Notion to Anki') })

exports.default = router
