import yauzl from 'yauzl';

export interface ApkgArchive {
  collectionBuffer: Buffer;
  collectionName: string;
  mediaManifestRaw: Buffer | null;
  mediaEntries: Map<string, Buffer>;
}

const COLLECTION_CANDIDATES = [
  'collection.anki21b',
  'collection.anki21',
  'collection.anki2',
];

function readEntry(
  zipfile: yauzl.ZipFile,
  entry: yauzl.Entry
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, stream) => {
      if (err || !stream) return reject(err ?? new Error('no stream'));
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  });
}

export async function extractApkg(bytes: Buffer): Promise<ApkgArchive> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(bytes, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) return reject(err ?? new Error('open failed'));

      const collections: Map<string, Buffer> = new Map();
      const mediaEntries: Map<string, Buffer> = new Map();
      let mediaManifestRaw: Buffer | null = null;

      zipfile.on('entry', (entry: yauzl.Entry) => {
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        readEntry(zipfile, entry)
          .then((buf) => {
            if (COLLECTION_CANDIDATES.includes(entry.fileName)) {
              collections.set(entry.fileName, buf);
            } else if (entry.fileName === 'media') {
              mediaManifestRaw = buf;
            } else if (/^\d+$/.test(entry.fileName)) {
              mediaEntries.set(entry.fileName, buf);
            }
            zipfile.readEntry();
          })
          .catch(reject);
      });

      zipfile.on('end', () => {
        const name = COLLECTION_CANDIDATES.find((candidate) =>
          collections.has(candidate)
        );
        if (!name) {
          reject(new Error('No Anki collection file found in archive'));
          return;
        }
        if (name === 'collection.anki21b') {
          reject(
            new Error(
              'This deck uses the zstd-compressed Anki 23.10+ format, which is not supported yet.'
            )
          );
          return;
        }
        resolve({
          collectionBuffer: collections.get(name) as Buffer,
          collectionName: name,
          mediaManifestRaw,
          mediaEntries,
        });
      });

      zipfile.on('error', reject);
      zipfile.readEntry();
    });
  });
}

export function parseMediaManifest(
  raw: Buffer | null
): Map<string, string> {
  const map = new Map<string, string>();
  if (!raw) return map;
  try {
    const json = JSON.parse(raw.toString('utf8')) as Record<string, string>;
    for (const [archiveName, originalName] of Object.entries(json)) {
      map.set(originalName, archiveName);
    }
  } catch {
    // Protobuf manifest not supported in slice 1; leave map empty.
  }
  return map;
}
