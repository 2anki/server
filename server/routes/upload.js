const path = require('path')
const fs = require('fs')
const os = require('os')

const { nanoid } = require('nanoid')
const express = require('express')
const multer = require('multer')

const { PrepareDeck } = require('../parser/deck')
const { ZipHandler } = require('../handlers/zip')
const { ErrorHandler } = require('../handlers/error')

const { TEMPLATE_DIR, ALLOWED_ORIGINS } = require('../constants')
const ADVERTISEMENT = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.html')).toString()

function TriggerUnsupportedFormat () {
  throw new Error('Markdown support has been removed, please use <a class="button" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7">HTML</a>')
}

function cleanDeckName (name) {
  let _name = name
  if (name.startsWith('&#x')) {
    _name = name.split(' ').slice(1).join('').trim()
  }
  console.log('cleanDeckName', _name)
  return _name
}

async function handleUpload (req, res) {
  console.log('POST', req.originalUrl)
  const origin = req.headers.origin
  const permitted = ALLOWED_ORIGINS.includes(origin)
  console.log('checking if', origin, 'is whitelisted', permitted)
  if (!permitted) {
    return res.status(403).end()
  }
  console.log('permitted access to', origin)
  res.set('Access-Control-Allow-Origin', origin)
  try {
    const files = req.files
    let decks = []
    for (const file of files) {
      const filename = file.originalname
      const settings = req.body || {}
      const payload = file.buffer

      console.log('filename', filename, 'with settings', settings)
      if (filename.match(/.html$/)) {
        console.log('We have a non zip upload')
        const d = await PrepareDeck(filename, { '{filename}': file.buffer.toString() }, settings)
        decks = decks.concat(d)
      } else if (filename.match(/.md$/)) {
        TriggerUnsupportedFormat()
      } else {
        const zipHandler = new ZipHandler()
        await zipHandler.build(payload)
        for (const fileName of zipHandler.getFileNames()) {
          if (fileName.match(/.html$/) && !fileName.includes('/')) {
            const d = await PrepareDeck(fileName, zipHandler.files, settings)
            decks.push(d)
          } else if (fileName.match(/.md$/)) {
            TriggerUnsupportedFormat()
          }
        }
      }
    }
    let payload
    let plen

    const deck = decks[0]
    if (decks.length === 1) {
      if (!deck.apkg) {
        const name = deck ? deck.name : 'untitled'
        throw new Error(`Could not produce APKG for ${name}`)
      }
      payload = deck.apkg
      plen = Buffer.byteLength(deck.apkg)
      res.set('Content-Type', 'application/apkg')
      res.set('Content-Length', plen)
      deck.name = cleanDeckName(deck.name)
      try {
        res.set('File-Name', deck.name)
      } catch (err) {
        console.log('failed to set name', deck.name)
      }
      res.attachment('/' + deck.name)
      res.status(200).send(payload)
    } else if (decks.length > 1) {
      const filename = `Your decks-${nanoid()}.zip`
      const pkg = path.join(os.tmpdir(), 'uploads', filename)
      payload = await ZipHandler.toZip(decks, ADVERTISEMENT)
      fs.writeFileSync(pkg, payload)
      try {
        res.set('File-Name', cleanDeckName(filename))
      } catch (err) {
        console.log('failed to set name', deck.name)
      }
      res.download(pkg)
    } else {
      throw new Error('Could not create any cards. Did you write any togglelists?')
    }
    // TODO: Schedule deletion?
  } catch (err) {
    console.error(err)
    ErrorHandler(res, err)
  }
}
const router = express.Router()
const m = multer({ storage: multer.memoryStorage() })
router.post('/', m.array('pakker'), (req, res) => handleUpload(req, res))

exports.default = router
