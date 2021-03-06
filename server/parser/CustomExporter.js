const path = require('path')
const fs = require('fs')

const CardGenerator = require('../service/generator').CardGenerator

class CustomExporter {
  constructor (firstDeckName, workspace) {
    this.firstDeckName = firstDeckName.replace('.html', '')
    this.workspace = workspace
    this.media = []
  }

  addMedia (newName, file) {
    const abs = path.join(this.workspace, newName)
    this.media.push(abs)
    fs.writeFileSync(abs, file)
  }

  addCard (back, tags) {
    return this
  }

  configure (payload) {
    const payloadInfo = path.join(this.workspace, 'deck_info.json')
    fs.writeFileSync(payloadInfo, JSON.stringify(payload, null, 2))
  }

  async save () {
    const gen = new CardGenerator(this.workspace)
    const payload = await gen.run()
    return fs.readFileSync(payload)
  }
}

module.exports.CustomExporter = CustomExporter
