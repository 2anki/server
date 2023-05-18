import fs from 'fs';

import express from 'express';

import { resolvePath } from '../lib/constants';

const appInfo = JSON.parse(
  fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString()
);
const getVersionInfo = (_req: express.Request, res: express.Response) =>
  res.status(200).send(`Notion to Anki v${appInfo.version}`);

const VersionController = { getVersionInfo };

export default VersionController;
