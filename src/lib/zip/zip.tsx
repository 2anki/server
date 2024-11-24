import { strFromU8, unzipSync } from 'fflate';
import { Body } from 'aws-sdk/clients/s3';
import { renderToStaticMarkup } from 'react-dom/server';
import { getUploadLimits } from '../misc/getUploadLimits';
import { isHTMLFile, isMarkdownFile, isPDFFile } from '../storage/checks';
import { processAndPrepareArchiveData } from './fallback/processAndPrepareArchiveData';

interface File {
  name: string;
  contents?: Body | string;
}

class ZipHandler {
  files: File[];
  zipFileCount: number;
  maxZipFiles: number;

  constructor(maxNestedZipFiles: number) {
    this.files = [];
    this.zipFileCount = 0;
    this.maxZipFiles = maxNestedZipFiles;
  }

  async build(zipData: Uint8Array, paying: boolean) {
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

    await this.processZip(zipData, paying);
  }

  private async processZip(zipData: Uint8Array, paying: boolean) {
    if (this.zipFileCount >= this.maxZipFiles) {
      throw new Error('Too many zip files in the upload.');
    }

    try {
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
          await this.processZip(file, paying);
        } else if ((isHTMLFile(name) || isMarkdownFile(name)) && contents) {
          this.files.push({ name, contents: strFromU8(file) });
        } else if (contents) {
          this.files.push({ name, contents });
        }
      }
    } catch (error: unknown) {
      // Code 13 indicates we need to use fallback archive processing
      const isArchiveProcessingError = (error as { code?: number }).code === 13;

      if (isArchiveProcessingError) {
        // Use fallback method to process archive
        const foundFiles = await processAndPrepareArchiveData(zipData, paying);
        this.files.push(...foundFiles);
        console.log('Processed files using fallback method:', this.files);
      } else {
        throw error;
      }
    }
  }

  getFileNames() {
    return this.files.map((file) => file.name);
  }
}

export { ZipHandler, File };
