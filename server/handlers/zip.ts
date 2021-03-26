import JSZip from 'jszip'

class ZipHandler {
  fileNames: string[]
  files: any

  constructor() {
    this.fileNames = []
    this.files = {}
  }

  async build (zipData: any) {
    const loadedZip = await JSZip.loadAsync(zipData)
    this.fileNames = Object.keys(loadedZip.files)
    this.fileNames = this.fileNames.filter(f => !f.endsWith('/'))
    this.files = {}

    for (const fileName of this.fileNames) {
      if (fileName.match(/.(md|html)$/)) {
        this.files[`${fileName}`] = await loadedZip.files[fileName].async('text')
      } else {
        this.files[`${fileName}`] = await loadedZip.files[fileName].async('uint8array')
      }
    }
  }

  getFileNames () {
    return this.fileNames
  }

  static toZip (decks: any[], advertisment: string | null) {
    const zip = new JSZip()
    for (const d of decks) {
      console.log('toZip add', d.name)
      zip.file(`${d.name}.apkg`, d.apkg)
    }
    if (advertisment) {
      zip.file('README.html', advertisment)
    }
    return zip.generateAsync({ type: 'nodebuffer' })
  }
}

export default ZipHandler