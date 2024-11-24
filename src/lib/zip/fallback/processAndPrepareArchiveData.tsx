import { renderToStaticMarkup } from 'react-dom/server';
import { getUploadLimits } from '../../misc/getUploadLimits';
import { decompress } from './decompress';
import { isZipContentFileSupported } from '../../../usecases/uploads/isZipContentFileSupported';

export const processAndPrepareArchiveData = async (
  byteArray: Uint8Array,
  isPatron: boolean = false
) => {
  const size = Buffer.byteLength(byteArray);
  const limits = getUploadLimits(isPatron);

  if (size > limits.fileSize) {
    throw new Error(
      renderToStaticMarkup(
        <>
          Your upload is too big, there is a max of {size} / ${limits.fileSize}{' '}
          currently. <a href="https://alemayhu.com/patreon">Become a patron</a>{' '}
          to remove default limit or{' '}
          <a href="https://2anki.net/login#login">login</a>.
        </>
      )
    );
  }

  const decompressedData = await decompress(byteArray);
  const fileNames = decompressedData.map((z) => z.name);
  const files = [];

  for (const name of fileNames) {
    const file = decompressedData.find((z) => z.name === name);
    let contents = file?.contents;
    if (isZipContentFileSupported(name) && contents) {
      const s = new TextDecoder().decode(contents as Uint8Array);
      files.push({ name, contents: s });
    } else if (contents) {
      files.push({ name, contents });
    }
  }

  return files;
};
