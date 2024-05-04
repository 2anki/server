import { getRandomUUID } from '../../../shared/helpers/getRandomUUID';
import Workspace from '../../parser/WorkSpace';
import path from 'path';
import fs from 'fs';

export function writeFile(compressedData: Uint8Array) {
  const uuid = getRandomUUID();
  const workspace = new Workspace(true, 'fs');
  const p = path.join(workspace.location, uuid);
  fs.writeFileSync(p, compressedData);
  return { workspace, filePath: p };
}
