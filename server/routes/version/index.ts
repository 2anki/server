import fs from 'fs';

import express from 'express';

import { resolvePath } from '../../lib/constants';

const router = express.Router();

const appInfo = JSON.parse(
  fs.readFileSync(resolvePath(__dirname, '../../package.json')).toString(),
);

router.get('/', (_req, res) => res.status(200).send(`Notion to Anki v${appInfo.version}`));

export default router;
