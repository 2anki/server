import path from 'path'
import fs from 'fs'
import os from 'os'

import { nanoid } from 'nanoid'
import express from 'express'
import multer from 'multer'

import { PrepareDeck} from '../parser/DeckParser'
import ZipHandler from '../handlers/zip'
import ErrorHandler from '../handlers/error'

import { TEMPLATE_DIR, ALLOWED_ORIGINS} from '../constants'
import Settings from '../parser/Settings'
const ADVERTISEMENT = fs.readFileSync(path.join(TEMPLATE_DIR, 'README.html')).toString()

function TriggerUnsupportedFormat () {
  throw new Error('Markdown support has been removed, please use <a class="button" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7">HTML</a>')
}

function cleanDeckName (name: string) {
  let _name = name
  if (name.startsWith('&#x')) {
    _name = name.split(' ').slice(1).join('').trim()
  }
  console.log('cleanDeckName', _name)
  return _name
}

async function handleUpload (req: express.Request, res: express.Response) {
  console.log('POST', req.originalUrl)
  const origin = req.headers.origin
  if (!origin) {
    throw new Error("unknown origin")
  }

  const permitted = ALLOWED_ORIGINS.includes(origin)
  console.log('checking if', origin, 'is whitelisted', permitted)
  if (!permitted) {
    return res.status(403).end()
  }
  console.log('permitted access to', origin)
  res.set('Access-Control-Allow-Origin', origin)
  try {
    const files = req.files as Express.Multer.File[]
    let decks: any[] = []
    for (const file of files) {
      const filename = file.originalname
      const settings = new Settings(req.body || {})
      const fileContents = fs.readFileSync(file.path)

      console.log('filename', filename, 'with settings', settings)
      if (filename.match(/.html$/)) {
        console.log('We have a non zip upload')
        const d = await PrepareDeck(filename, { '{filename}': file.buffer.toString() }, settings)
        decks = decks.concat(d)
      } else if (filename.match(/.md$/)) {
        TriggerUnsupportedFormat()
      } else {
        const zipHandler = new ZipHandler()
        await zipHandler.build(fileContents)
        for (const fileName of zipHandler.getFileNames()) {
          console.log('file', fileName)
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
      res.set('Content-Length', plen.toString())
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
      const ws = process.env.WORKSPACE_BASE
      if (!ws) {
        throw new Error("Missing workspace value")
      }
      const pkg = path.join(ws, filename)
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

// Ensure uploads directory exists
const uploadPath = path.join(os.tmpdir(), 'uploads/')
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {recursive: true})
}

const m = multer({ dest: uploadPath,  limits: { fileSize: 100 * 1024 * 1024}})
router.post('/', m.array('pakker'), (req, res) => handleUpload(req, res))

export default router