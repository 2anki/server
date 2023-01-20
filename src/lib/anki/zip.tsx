import JSZip from 'jszip';
import { strFromU8, unzipSync } from 'fflate';
import Package from '../parser/Package';
import { Body } from 'aws-sdk/clients/s3';

interface File {
  name: string;
  contents?: Body | string;
}

class ZipHandler {
  fileNames: string[];

  files: File[];

  constructor() {
    this.fileNames = [];
    this.files = [];
  }

  async build(zipData: Uint8Array) {
    const loadedZip = unzipSync(zipData, {
      filter(file) {
        return !file.name.endsWith('/');
      },
    });
    this.fileNames = Object.keys(loadedZip);
    this.files = [];

    for (const name of this.fileNames) {
      const file = loadedZip[name];
      let contents = file;
      if (name.match(/.(md|html)$/) && contents) {
        this.files.push({ name, contents: strFromU8(file) });
      } else if (contents) {
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
