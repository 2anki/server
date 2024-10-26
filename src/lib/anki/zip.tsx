import { strFromU8, unzipSync } from 'fflate';
import { Body } from 'aws-sdk/clients/s3';
import { renderToStaticMarkup } from 'react-dom/server';
import { getUploadLimits } from '../misc/getUploadLimits';
import { isHTMLFile, isMarkdownFile, isPDFFile } from '../storage/checks';

interface File {
  name: string;
  contents?: Body | string;
}

class ZipHandler {
  fileNames: string[];
  files: File[];
  zipFileCount: number;
  maxZipFiles: number;

  constructor(maxNestedZipFiles: number) {
    this.fileNames = [];
    this.files = [];
    this.zipFileCount = 0;
    this.maxZipFiles = maxNestedZipFiles;
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

    this.processZip(zipData);
  }

  private processZip(zipData: Uint8Array) {
    if (this.zipFileCount >= this.maxZipFiles) {
      throw new Error('Too many zip files in the upload.');
    }

    const loadedZip = unzipSync(zipData, {
      filter(file) {
        return !file.name.endsWith('/');
      },
    });

    for (const name in loadedZip) {
      const file = loadedZip[name];
      let contents = file;

      if (name.includes('__MACOSX/') || isPDFFile(name)) {
        continue;
      }

      if (name.endsWith('.zip')) {
        this.zipFileCount++;
        this.processZip(file);
      } else if ((isHTMLFile(name) || isMarkdownFile(name)) && contents) {
        this.files.push({ name, contents: strFromU8(file) });
      } else if (contents) {
        this.files.push({ name, contents });
      }
    }

    this.fileNames = this.files.map((file) => file.name);
  }

  getFileNames() {
    return this.fileNames;
  }
}

export { ZipHandler, File };
