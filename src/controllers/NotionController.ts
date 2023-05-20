import { Request, Response } from 'express';

import NotionRepository from '../data_layer/NotionRespository';
import NotionConnectionHandler from '../lib/notion/NotionConnectionHandler';
import TokenHandler from '../lib/misc/TokenHandler';
import { sendError } from '../lib/error/sendError';
import { getNotionAPI } from '../lib/notion/helpers/getNotionAPI';
import NotionAPIWrapper from '../lib/notion/NotionAPIWrapper';
import performConversion from '../lib/storage/jobs/helpers/performConversion';
import getBlocks from '../routes/notion/getBlocks';
import getBlock from '../routes/notion/getBlock';
import createBlock from '../routes/notion/createBlock';
import renderBlock from '../routes/notion/renderBlock';
import { isValidID } from '../routes/notion/isValidID';
import getDatabase from '../routes/notion/getDatabase';
import { queryDatabase } from '../routes/notion/queryDatabase';

class NotionController {
  constructor(private readonly repository: NotionRepository) {}

  async connect(req: Request, res: Response) {
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
  }

  async search(req: Request, res: Response) {
    const query = req.body.query.toString() || '';
    const api = await getNotionAPI(req, res);
    const s = await api.search(query);
    res.json(s);
  }

  async getNotionLink(_req: Request, res: Response) {
    console.debug('/get-notion-link');
    const clientId = NotionAPIWrapper.GetClientID();

    if (!clientId) {
      return res.status(400).send();
    }

    const notionData = await this.repository.getNotionData(res.locals.owner);
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
  }

  async convert(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    const { id, title } = req.body;
    if (!id) {
      return res.status(400).send({ error: 'id is required' });
    }
    return performConversion({
      api,
      id,
      owner: res.locals.owner,
      req,
      res,
      title,
    });
  }

  async getPage(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const api = await getNotionAPI(req, res);
    const page = await api.getPage(id.replace(/\-/g, ''));
    return res.json(page);
  }

  async getBlocks(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    return getBlocks(api, req, res);
  }

  async getBlock(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    return getBlock(api, req, res);
  }

  async createBlock(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    return createBlock(api, req, res);
  }

  async deleteBlock(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.deleteBlock(id);
    return res.json(block);
  }

  async renderBlock(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidID(id)) {
      return res.status(400).send();
    }
    const api = await getNotionAPI(req, res);
    await renderBlock(api, id.replace(/\-/g, ''), res);
  }

  async getDatabase(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidID(id)) {
      return res.status(400).send();
    }
    const api = await getNotionAPI(req, res);
    return getDatabase(api, req, res);
  }

  async queryDatabase(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    return queryDatabase(api, req, res);
  }
}

export default NotionController;
