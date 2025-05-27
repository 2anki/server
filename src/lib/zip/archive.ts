import archiver from 'archiver';
import fs from 'fs';
import stream from 'stream';

interface FileInfo {
  filePath: string;
  name: string;
}

export function createZipArchive(files: FileInfo[]): stream.Readable {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  archive.on('warning', (err) => {
    console.warn(err);
  });

  archive.on('error', (err) => {
    console.error('Archive creation error:', err);
    // For robust error handling, this might need to propagate the error
    // to the caller, perhaps by emitting an error on the stream itself
    // or by returning a Promise that rejects.
    // For now, it logs and the stream might end prematurely or hang.
  });

  // Pipe the archive data to a PassThrough stream, which can be returned and used by the caller.
  // This is useful because archiver itself is a transform stream and calling `finalize`
  // makes it behave in a way that might not be directly returnable for immediate piping
  // in some contexts without careful handling of its 'end' event.
  // A PassThrough stream simplifies this.
  const passThrough = new stream.PassThrough();
  archive.pipe(passThrough);

  for (const file of files) {
    if (fs.existsSync(file.filePath)) {
      archive.file(file.filePath, { name: file.name });
    } else {
      console.error(`File not found: ${file.filePath}, skipping.`);
      // Optionally, emit an error on the passThrough stream or throw
      // archive.emit('error', new Error(`File not found: ${file.filePath}`));
    }
  }

  archive.finalize().catch(err => {
    // Catch error during finalization (e.g. if stream is closed prematurely)
    console.error('Error during archive finalization:', err);
    passThrough.emit('error', err); // Propagate error to the readable stream
  });

  return passThrough;
}
