import { writeFile } from './writeFile';
import { unpack } from './unpack';
import { File } from './types';

export function decompress(byteArray: Uint8Array): Promise<File[]> {
  const { workspace, filePath } = writeFile(byteArray);
  return unpack(filePath, workspace.location);
}
