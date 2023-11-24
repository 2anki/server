import path from 'path';
import fs from 'fs';

import Package from '../../lib/parser/Package';
import Workspace from '../../lib/parser/WorkSpace';

export interface CreatedDeck {
  name: string;
  link: string;
}
export const createResponse = (packages: Package[]) => {
  const workspace = new Workspace(true, 'fs');
  const basePath = `/download/${workspace.id}`;
  const createdDecks = [];
  for (const pkg of packages) {
    const p = path.join(workspace.location, pkg.name);
    fs.writeFileSync(p, pkg.apkg);
    createdDecks.push({
      name: pkg.name,
      link: `${basePath}/${pkg.name}`,
    });
  }
  return createdDecks;
};
