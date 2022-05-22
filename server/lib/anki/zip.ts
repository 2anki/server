import JSZip from 'jszip';
import { MAX_UPLOAD_SIZE } from '../misc/file';
import Package from '../parser/Package';

interface File {
  name: string;
  contents: string | Uint8Array;
}

class ZipHandler {
  fileNames: string[];

  files: File[];

  constructor() {
    this.fileNames = [];
    this.files = [];
  }

  async build(zipData: Buffer) {
    const size = Buffer.byteLength(zipData);
    if (size > MAX_UPLOAD_SIZE) {
      throw new Error(
        `Zip data is too big max is ${MAX_UPLOAD_SIZE} but got ${size}`
      );
    }

    const loadedZip = await JSZip.loadAsync(zipData);
    this.fileNames = Object.keys(loadedZip.files);
    this.fileNames = this.fileNames.filter((f) => !f.endsWith('/'));
    this.files = [];

    for (const name of this.fileNames) {
      let contents;
      if (name.match(/.(md|html)$/)) {
        contents = await loadedZip.files[name].async('text');
      } else {
        contents = await loadedZip.files[name].async('uint8array');
      }
      if (contents) {
        this.files.push({ name, contents });
      }
    }
  }

  getFileNames() {
    return this.fileNames;
  }

  static toZip(decks: Package[], advertisment: string | null) {
    const zip = new JSZip();
    for (const d of decks) {
      zip.file(`${d.name}.apkg`, d.apkg);
    }
    if (advertisment) {
      zip.file('README.html', advertisment);
    }
    return zip.generateAsync({ type: 'nodebuffer' });
  }
}

export { ZipHandler, File };
