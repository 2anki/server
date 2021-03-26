import { execFile } from 'child_process'
import { homedir } from 'os'
import path from 'path'

import { resolvePath } from '../constants'

function PYTHON () {
  const os = process.platform
  if (os === 'win32') {
    return `${homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe`
  }
  return '/usr/bin/python3'
}

class CardGenerator {
  // TODO: use better names!
  ccs: string
  cwd: string

  constructor (workspace: string) {
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
          resolve(stdout)
        }
      })
    })
  }
}

export default CardGenerator