import { Request, Response } from 'express';

import NotionRepository from '../data_layer/NotionRespository';
import NotionConnectionHandler from '../lib/notion/NotionConnectionHandler';
import TokenHandler from '../lib/misc/TokenHandler';
import { sendError } from '../lib/error/sendError';
import { getNotionAPI } from '../lib/notion/helpers/getNotionAPI';
import NotionAPIWrapper from '../lib/notion/NotionAPIWrapper';
import performConversion from '../lib/storage/jobs/helpers/performConversion';
import { isValidID } from '../lib/notion/isValidID';
import { getNotionId } from '../lib/notion/getNotionId';
import Settings from '../lib/parser/Settings';
import BlockHandler from '../lib/notion/BlockHandler/BlockHandler';
import CustomExporter from '../lib/parser/CustomExporter';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Workspace from '../lib/parser/WorkSpace';
import { blockToStaticMarkup } from '../lib/notion/helpers/blockToStaticMarkup';

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
    const page = await api.getPage(id.replace(/-/g, ''));
    return res.json(page);
  }

  async getBlocks(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    console.info('[NO_CACHE] - getBlocks');
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const blocks = await api.getBlocks({
      all: res.locals.patreon,
      createdAt: '',
      lastEditedAt: '',
      id,
    });
    res.json(blocks);
  }

  async getBlock(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.getBlock(id);
    res.json(block);
  }

  async createBlock(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.createBlock(id, req.body.newBlock);
    res.json(block);
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
    const query = id.replace(/-/g, '');
    const api = await getNotionAPI(req, res);
    const blockId = getNotionId(query) ?? query;
    const block = await api.getBlock(blockId);
    const settings = new Settings(Settings.LoadDefaultOptions());
    settings.learnMode = true; // option to handle breaking changes
    let handler = new BlockHandler(
      new CustomExporter('x', new Workspace(true, 'fs').location),
      api,
      settings
    );
    await handler.getBackSide(block as BlockObjectResponse, false);
    const frontSide = await blockToStaticMarkup(
      handler,
      block as BlockObjectResponse
    );
    return res.json({ html: frontSide });
  }

  async getDatabase(req: Request, res: Response) {
    const { id } = req.params;
    if (!isValidID(id)) {
      return res.status(400).send();
    }
    const api = await getNotionAPI(req, res);
    try {
      // todo: review
      let cleanId = id.replace(/-/g, '');
      if (cleanId.includes('/')) {
        cleanId = getNotionId(req.params.id) ?? cleanId;
      }
      const database = await api.getDatabase(id);
      console.log('database', database);
      res.json(database);
    } catch (error) {
      sendError(error);
      res.status(500).send();
    }
  }

  async queryDatabase(req: Request, res: Response) {
    const api = await getNotionAPI(req, res);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const results = await api.queryDatabase(id);
    res.json(results);
  }
}

export default NotionController;
