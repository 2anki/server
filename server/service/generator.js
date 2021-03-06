const { execFile } = require('child_process')
const { homedir } = require('os')
const path = require('path')

const { resolvePath } = require('../constants')

function PYTHON () {
  const os = process.platform
  if (os === 'win32') {
    return `${homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe`
  }
  return '/usr/bin/python3'
}

class CardGenerator {
  constructor (workspace) {
    this.ccs = resolvePath(__dirname, '../genanki/create_deck.py')
    this.cwd = workspace
  }

  async run () {
    const dpayload = path.join(this.cwd, 'deck_info.json')
    const tdir = resolvePath(__dirname, '../templates/')
    const dsc = path.join(this.cwd, 'deck_style.css')

    const ccsARGS = [this.ccs, dpayload, dsc, tdir]
    return new Promise((resolve, reject) => {
      execFile(PYTHON(), ccsARGS, { cwd: this.cwd }, (err, stdout, stderr) => {
        if (err) {
          console.log('stderr::', stderr)
          console.error(err)
          reject(err)
        } else {
          console.log('status from create_deck', stdout)
          resolve(stdout)
        }
      })
    })
  }
}

module.exports.CardGenerator = CardGenerator
