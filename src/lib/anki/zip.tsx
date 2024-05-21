import JSZip from 'jszip';
import { strFromU8, unzipSync } from 'fflate';
import Package from '../parser/Package';
import { Body } from 'aws-sdk/clients/s3';
import { renderToStaticMarkup } from 'react-dom/server';
import { getUploadLimits } from '../misc/getUploadLimits';
import { isHTMLFile, isMarkdownFile } from '../storage/checks';
import getDeckFilename from './getDeckFilename';

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

  build(zipData: Uint8Array, paying: boolean) {
    const size = Buffer.byteLength(zipData);
    const limits = getUploadLimits(paying);

    if (size > limits.fileSize) {
      throw new Error(
        renderToStaticMarkup(
          <>
            Your upload is too big, there is a max of {size} / $
            {limits.fileSize} currently.{' '}
            <a href="https://alemayhu.com/patreon">Become a patron</a> to remove
            default limit.
          </>
        )
      );
    }
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
      if ((isHTMLFile(name) || isMarkdownFile(name)) && contents) {
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
      zip.file(getDeckFilename(d), d.apkg);
    }
    if (advertisment) {
      zip.file('README.html', advertisment);
    }
    return zip.generateAsync({ type: 'nodebuffer' });
  }
}

export { ZipHandler, File };
