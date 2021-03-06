const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const os = require('os')

const { nanoid, customAlphabet } = require('nanoid')
const cheerio = require('cheerio')

const { CustomExporter } = require('./CustomExporter')

const replaceAll = function (original, oldValue, newValue) {
  if (oldValue === newValue) {
    return original
  }

  let temp = original
  let index = temp.indexOf(oldValue)
  while (index !== -1) {
    temp = temp.replace(oldValue, newValue)
    index = temp.indexOf(oldValue)
  }
  return temp
}

class DeckParser {
  get name () {
    return this.payload[0].name
  }

  constructor (fileName, settings = {}, files) {
    const deckName = settings.deckName
    const contents = files[fileName]
    this.settings = settings
    this.use_input = this.enableInput()
    this.image = null
    this.files = files || []
    this.firstDeckName = fileName
    this.payload = this.handleHTML(fileName, contents, deckName)
  }

  findNextPage (href, fileName) {
    const nextFileName = global.decodeURIComponent(href)
    const pageContent = this.files[nextFileName]
    const match = Object.keys(this.files).find($1 => $1.match(nextFileName))
    if (match) {
      return this.files[match]
    }
    return pageContent
  }

  noteHasCherry (note) {
    const cherry = '&#x1F352;'
    return note.name.includes(cherry) ||
    note.back.includes(cherry) ||
    note.name.includes('🍒') ||
    note.back.includes('🍒')
  }

  maxOne () {
    return this.settings['max-one-toggle-per-card'] === 'true'
  }

  findToggleLists (dom) {
    const isCherry = this.settings.cherry !== 'false'
    const isAll = this.settings.all === 'true'
    const selector = isCherry || isAll ? '.toggle' : '.page-body > ul'
    return dom(selector).toArray()
  }

  removeNestedToggles (input) {
    return input
      .replace(/<details(.*?)>(.*?)<\/details>/g, '')
      .replace(/<summary>(.*?)<\/summary>/g, '')
      .replace(/<li><\/li>/g, '')
      .replace(/<ul[^/>][^>]*><\/ul>/g, '')
      .replace(/<\/details><\/li><\/ul><\/details><\/li><\/ul>/g, '')
      .replace(/<\/details><\/li><\/ul>/g, '')
      .replace(/<p[^/>][^>]*><\/p>/g, '')
  }

  setFontSize (style) {
    let fs = this.settings['font-size']
    if (fs && fs !== '20px') {
      fs = fs.endsWith('px') ? fs : fs + 'px'
      style += '\n' + '* { font-size:' + fs + 'px}'
    }
    return style
  }

  handleHTML (fileName, contents, deckName = null, decks = []) {
    const dom = cheerio.load(this.settings['no-underline'] === 'true' ? contents.replace(/border-bottom:0.05em solid/g, '') : contents)
    let name = deckName || dom('title').text()
    let style = dom('style').html()
    style = style.replace(/white-space: pre-wrap;/g, '')
    const isCherry = this.settings.cherry !== 'false'
    const isTextOnlyBack = this.settings.paragraph === 'true'
    let image = null

    style = this.setFontSize(style)

    const pageCoverImage = dom('.page-cover-image')
    if (pageCoverImage) {
      image = pageCoverImage.attr('src')
    }

    const pageIcon = dom('.page-header-icon > .icon')
    const pi = pageIcon.html()
    if (pi) {
      if (!name.includes(pi) && decks.length === 0) {
        if (!name.includes('::') && !name.startsWith(pi)) {
          name = `${pi} ${name}`
        } else {
          const names = name.split(/::/)
          const end = names.length - 1
          const last = names[end]
          names[end] = `${pi} ${last}`
          name = names.join('::')
        }
      }
    }

    this.globalTags = dom('.page-body > p > del')
    const toggleList = this.findToggleLists(dom)
    let cards = toggleList.map((t) => {
      // We want to perserve the parent's style, so getting the class
      const p = dom(t)
      const parentUL = p
      const parentClass = p.attr('class')

      const toggleMode = this.settings['toggle-mode']
      if (toggleMode === 'open_toggle') {
        dom('details').attr('open', '')
      } else if (toggleMode === 'close_toggle') {
        dom('details').removeAttr('open')
      }

      if (parentUL) {
        dom('details').addClass(parentClass)
        dom('summary').addClass(parentClass)
        const summary = parentUL.find('summary').first()
        const toggle = parentUL.find('details').first()

        if (!summary || !summary.text()) {
          return null
        }
        const front = parentClass ? `<div class='${parentClass}'>${summary.html()}</div>` : summary.html()

        if ((summary && toggle) || (this.maxOne() && toggle.text())) {
          const toggleHTML = toggle.html()
          if (toggleHTML) {
            let b = toggleHTML.replace(summary, '')
            if (isTextOnlyBack) {
              const paragraphs = dom(toggle).find('> p').toArray()
              b = ''
              for (const p of paragraphs) {
                if (p) {
                  b += dom(p).html()
                }
              }
            }
            const note = { name: front, back: this.maxOne() ? this.removeNestedToggles(b) : b }
            if (isCherry && !this.noteHasCherry(note)) {
              return null
            } else {
              return note
            }
          }
        }
      }
      return null
    })

    //  Prevent bad cards from leaking out
    cards = cards.filter(Boolean)
    cards = this.sanityCheck(cards)

    decks.push({ name: name, cards: cards, image: image, style: style, id: this.generateId() })

    const subpages = dom('.link-to-page').toArray()
    for (const page of subpages) {
      const spDom = dom(page)
      const ref = spDom.find('a').first()
      const href = ref.attr('href')
      const pageContent = this.findNextPage(href, fileName)
      if (pageContent) {
        const subDeckName = spDom.find('title').text() || ref.text()
        this.handleHTML(fileName, pageContent, `${name}::${subDeckName}`, decks)
      }
    }
    return decks
  }

  hasClozeDeletions (input) {
    if (!input) {
      return false
    }
    return input.includes('code')
  }

  validInputCard (input) {
    if (!this.enableInput()) {
      return false
    }
    return input.name && input.name.includes('strong')
  }

  sanityCheck (cards) {
    return cards.filter(c => c.name && (this.hasClozeDeletions(c.name) || c.back || this.validInputCard(c)))
  }

  // Try to avoid name conflicts && invalid characters by hashing
  newUniqueFileName (input) {
    const shasum = crypto.createHash('sha1')
    shasum.update(input)
    return shasum.digest('hex')
  }

  suffix (input) {
    if (!input) {
      return null
    }
    const m = input.match(/\.[0-9a-z]+$/i)
    if (!m) {
      return null
    }
    return m[0]
  }

  setupExporter (deck, workspace) {
    const css = replaceAll(deck.style, "'", '"')
    fs.mkdirSync(workspace)
    fs.writeFileSync(path.join(workspace, 'deck_style.css'), css)
    return new CustomExporter(this.firstDeckName, workspace)
  }

  embedFile (exporter, files, filePath) {
    const suffix = this.suffix(filePath)
    if (!suffix) {
      return null
    }
    let file = files[`${filePath}`]
    if (!file) {
      const lookup = `${exporter.firstDeckName}/${filePath}`.replace(/\.\.\//g, '')
      file = files[lookup]
      if (!file) {
        throw new Error(`Missing relative path to ${filePath} used ${exporter.firstDeckName}`)
      }
    }
    const newName = this.newUniqueFileName(filePath) + suffix
    exporter.addMedia(newName, file)
    return newName
  }

  // https://stackoverflow.com/questions/6903823/regex-for-youtube-id
  getYouTubeID (input) {
    this.ensureNotNull(input, () => {
      try {
        const m = input.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/)
        if (!m || m.length === 0) {
          return null
        }
        // prevent swallowing of soundcloud embeds
        if (m[0].match(/https:\/\/soundcloud.com/)) {
          return null
        }
        return m[1]
      } catch (error) {
        console.log('error in getYouTubeID')
        console.error(error)
        return null
      }
    })
  }

  ensureNotNull (input, cb) {
    if (!input || !input.trim()) {
      return null
    } else {
      cb()
    }
  }

  getSoundCloudURL (input) {
    this.ensureNotNull(input, () => {
      try {
        const sre = /https?:\/\/soundcloud\.com\/\S*/gi
        const m = input.match(sre)
        if (!m || m.length === 0) {
          return null
        }
        return m[0].split('">')[0]
      } catch (error) {
        console.log('error in getSoundCloudURL')
        console.error(error)
        return null
      }
    })
  }

  getMP3File (input) {
    this.ensureNotNull(input, () => {
      try {
        let m = input.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)
        if (!m || m.length < 3) {
          return null
        }
        m = m[2]
        if (!m.endsWith('.mp3') && m.startsWith('http')) {
          return null
        }
        return m
      } catch (error) {
        return null
      }
    })
  }

  handleClozeDeletions (input) {
    const dom = cheerio.load(input)
    const clozeDeletions = dom('code')
    let mangle = input
    const numbers = [
      '1&#xFE0F;&#x20E3;', '1️⃣',
      '2&#xFE0F;&#x20E3;', '2️⃣',
      '3&#xFE0F;&#x20E3;', '3️⃣',
      '4&#xFE0F;&#x20E3;', '4️⃣',
      '5&#xFE0F;&#x20E3;', '5️⃣',
      '6&#xFE0F;&#x20E3;', '6️⃣',
      '7&#xFE0F;&#x20E3;', '7️⃣',
      '8&#xFE0F;&#x20E3;', '8️⃣',
      '9&#xFE0F;&#x20E3;', '9️⃣',
      '&#x1F51F;', '🔟'
    ]
    clozeDeletions.each((i, elem) => {
      const v = dom(elem).html()
      let usedIndex = false
      for (const num of numbers) {
        const old = `${num}<code>${v}</code>`
        const newValue = '{{c' + (numbers.indexOf(num) + 1) + '::' + v + '}}'
        if (mangle.includes(old)) {
          usedIndex = true
        }
        mangle = replaceAll(mangle, old, newValue)
      }

      if (!usedIndex) {
        const old = `<code>${v}</code>`
        const newValue = '{{c' + (i + 1) + '::' + v + '}}'
        mangle = replaceAll(mangle, old, newValue)
      }
    })

    return mangle
  }

  treatBoldAsInput (input, inline = false) {
    const dom = cheerio.load(input)
    const underlines = dom('strong')
    let mangle = input
    let answer = ''
    underlines.each((i, elem) => {
      const v = dom(elem).html()
      const old = `<strong>${v}</strong>`
      mangle = replaceAll(mangle, old, inline ? v : '{{type:Input}}')
      answer = v
    })
    return { mangle: mangle, answer: answer }
  }

  isCloze () {
    return this.settings.cloze !== 'false'
  }

  enableInput () {
    return this.settings['enable-input'] !== 'false'
  }

  generateId () {
    return parseInt(customAlphabet('1234567890', 16)())
  }

  locateTags (card) {
    const input = [card.name, card.back]

    for (const i of input) {
      if (!i) {
        continue
      }

      const dom = cheerio.load(i)
      const deletionsDOM = dom('del')
      const deletionsArray = [deletionsDOM, this.globalTags]
      if (!card.tags) {
        card.tags = []
      }
      for (const deletions of deletionsArray) {
        deletions.each((i, elem) => {
          const del = dom(elem)
          card.tags.push(...del.text().split(',').map($1 => $1.trim().replace(/\s/g, '-')))
          card.back = replaceAll(card.back, del.html(), '')
          card.name = replaceAll(card.name, del.html(), '')
        })
      }
    }
    return card
  }

  async build () {
    const workspace = path.join(os.tmpdir(), nanoid())
    const exporter = this.setupExporter(this.payload[0], workspace)

    for (let i = 0; i < this.payload.length; i += 1) {
      const deck = this.payload[i]
      deck['empty-deck-desc'] = this.settings['empty-deck-desc'] !== 'false'
      const cardCount = deck.cards.length
      deck.image_count = 0

      deck.cardCount = cardCount
      deck.id = this.generateId()
      delete deck.style

      // Counter for perserving the order in Anki deck.
      let counter = 0
      const addThese = []
      for (let j = 0; j < deck.cards.length; j += 1) {
        let card = deck.cards[j]
        card['enable-input'] = this.settings['enable-input'] !== 'false'
        card.cloze = this.isCloze()
        card.number = counter++

        if (card.cloze) {
          card.name = this.handleClozeDeletions(card.name)
        }

        if (this.use_input && card.name.includes('<strong>')) {
          const inputInfo = this.treatBoldAsInput(card.name)
          card.name = inputInfo.mangle
          card.answer = inputInfo.answer
        }

        card.media = []
        if (card.back) {
          const dom = cheerio.load(card.back)
          const images = dom('img')
          if (images.length > 0) {
            images.each((i, elem) => {
              const originalName = dom(elem).attr('src')
              if (!originalName.startsWith('http')) {
                const newName = this.embedFile(exporter, this.files, global.decodeURIComponent(originalName))
                if (newName) {
                  dom(elem).attr('src', newName)
                  card.media.push(newName)
                }
              }
            })
            deck.image_count += (card.back.match(/<+\s?img/g) || []).length
            card.back = dom.html()
          }

          const audiofile = this.getMP3File(card.back)
          if (audiofile) {
            const newFileName = this.embedFile(exporter, this.files, global.decodeURIComponent(audiofile))
            if (newFileName) {
              card.back += `[sound:${newFileName}]`
              card.media.push(newFileName)
            }
          }
          // Check YouTube
          const id = this.getYouTubeID(card.back)
          if (id) {
            const ytSrc = `https://www.youtube.com/embed/${id}?`.replace(/"/, '')
            const video = `<iframe width='560' height='315' src='${ytSrc}' frameborder='0' allowfullscreen></iframe>`
            card.back += video
          }

          const soundCloudUrl = this.getSoundCloudURL(card.back)
          if (soundCloudUrl) {
            const audio = `<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=${soundCloudUrl}'></iframe>`
            card.back += audio
          }

          if (this.use_input && card.back.includes('<strong>')) {
            const inputInfo = this.treatBoldAsInput(card.back, true)
            card.back = inputInfo.mangle
          }
        }

        if (!card.tags) {
          card.tags = []
        }
        if (this.settings.tags !== 'false') {
          card = this.locateTags(card)
        }

        if (this.settings['basic-reversed'] !== 'false') {
          addThese.push({ name: card.back, back: card.name, tags: card.tags, media: card.media, number: counter++ })
        }

        if (this.settings.reversed !== 'false') {
          const tmp = card.back
          card.back = card.name
          card.name = tmp
        }
      }
      deck.cards = deck.cards.concat(addThese)
    }

    this.payload[0].cloze_model_name = this.settings.cloze_model_name
    this.payload[0].basic_model_name = this.settings.basic_model_name
    this.payload[0].input_model_name = this.settings.input_model_name
    this.payload[0].cloze_model_id = this.settings.cloze_model_id
    this.payload[0].basic_model_id = this.settings.basic_model_id
    this.payload[0].input_model_id = this.settings.input_model_id
    this.payload[0].template = this.settings.template

    exporter.configure(this.payload)
    return exporter.save()
  }
}

async function PrepareDeck (fileName, files, settings) {
  const parser = new DeckParser(fileName, settings, files)
  const apkg = await parser.build()
  return { name: `${parser.name}.apkg`, apkg: apkg, deck: parser.payload }
}

module.exports.PrepareDeck = PrepareDeck
module.exports.DeckParser = DeckParser
