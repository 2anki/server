import express from 'express';
import TokenHandler from '../../lib/misc/TokenHandler';
import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import NotionConnectionHandler from '../../lib/notion/NotionConnectionHandler';
import DB from '../../lib/storage/db';

import RequireAuthentication from '../../middleware/RequireAuthentication';
import convertPage from './convert/convertPage';
import getBlocks from './getBlocks';
import getBlock from './getBlock';
import getDatabase from './getDatabase';
import { queryDatabase } from './queryDatabase';
import renderBlock from './renderBlock';
import deleteBlock from './deleteBlock';
import createBlock from './createBlock';
import { sendError } from '../../lib/error/sendError';
import { getNotionAPI } from '../../lib/notion/helpers/getNotionAPI';
import { isValidID } from './isValidID';

const router = express.Router();

/**
 * Endpoint for establishing a connection to Notion. We need a token for this.
 * Reference: https://developers.notion.so/
 */
router.get('/connect', RequireAuthentication, async (req, res) => {
  const { code } = req.query;
  if (code) {
    try {
      const n = NotionConnectionHandler.Default();
      const accessData = await n.getAccessData(code.toString());
      await TokenHandler.SaveNotionToken(res.locals.owner, accessData);
      return res.redirect('/search');
    } catch (err) {
      sendError(err);
      return res.redirect('/search');
    }
  } else {
    return res.redirect('/search');
  }
});

router.post('/pages', RequireAuthentication, async (req, res) => {
  const query = req.body.query.toString() || '';
  const api = await getNotionAPI(req, res);
  const s = await api.search(query);
  res.json(s);
});

router.get('/get-notion-link', RequireAuthentication, async (_req, res) => {
  console.debug('/get-notion-link');
  const clientId = NotionAPIWrapper.GetClientID();

  if (!clientId) {
    return res.status(400).send();
  }

  const notionData = await DB('notion_tokens')
    .where({ owner: res.locals.owner })
    .returning(['token', 'workspace_name'])
    .first();

  const link = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&response_type=code`;
  if (notionData) {
    return res.status(200).send({
      link,
      isConnected: !!notionData.token,
      workspace: notionData.workspace_name,
    });
  }
  return res.status(200).send({
    link,
    isConnected: false,
    workspace: null,
  });
});

router.post('/convert/', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return convertPage(api, req, res);
});
router.get('/page/:id', RequireAuthentication, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send();
  }
  const api = await getNotionAPI(req, res);
  const page = await api.getPage(id.replace(/\-/g, ''));
  return res.json(page);
});

router.get('/blocks/:id', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return getBlocks(api, req, res);
});

router.get('/block/:id', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return getBlock(api, req, res);
});

router.post('/block/:id', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return createBlock(api, req, res);
});

router.delete('/block/:id', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return deleteBlock(api, req, res);
});

router.get('/render-block/:id', RequireAuthentication, async (req, res) => {
  const { id } = req.params;
  if (!isValidID(id)) {
    return res.status(400).send();
  }
  const api = await getNotionAPI(req, res);
  await renderBlock(api, id.replace(/\-/g, ''), res);
});

router.get('/database/:id', RequireAuthentication, async (req, res) => {
  const { id } = req.params;
  if (!isValidID(id)) {
    return res.status(400).send();
  }
  const api = await getNotionAPI(req, res);
  return getDatabase(api, req, res);
});

router.get('/database/query/:id', RequireAuthentication, async (req, res) => {
  const api = await getNotionAPI(req, res);
  return queryDatabase(api, req, res);
});

export default router;
