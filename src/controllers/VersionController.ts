import fs from 'fs';

import express from 'express';

import { resolvePath } from '../lib/constants';

const appInfo = JSON.parse(
  fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString()
);

const getVersionInfo = (_req: express.Request, res: express.Response) =>
  res.status(200).send(`Notion to Anki v${appInfo.version}`);

// TODO: add a admin endpoint which logs out psql version, dokku version, etc. This endpoint requires authentication and should only be used for debugging.

const VersionController = { getVersionInfo };

export default VersionController;
