import { Request, Response } from 'express';

import { sendError } from '../lib/error/sendError';
import performConversion from '../lib/storage/jobs/helpers/performConversion';
import Settings from '../lib/parser/Settings';
import BlockHandler from '../services/NotionService/BlockHandler/BlockHandler';
import CustomExporter from '../lib/parser/CustomExporter';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Workspace from '../lib/parser/WorkSpace';
import { blockToStaticMarkup } from '../services/NotionService/helpers/blockToStaticMarkup';
import NotionService from '../services/NotionService';
import { getDatabase } from '../data_layer';
import { getNotionId } from '../services/NotionService/getNotionId';

class NotionController {
  constructor(private readonly service: NotionService) {}

  async connect(req: Request, res: Response) {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/search');
    }

    try {
      const authorizationCode = code as string;
      await this.service.connectToNotion(authorizationCode, res.locals.owner);
      return res.redirect('/search');
    } catch (err) {
      sendError(err);
      return res.redirect('/search');
    }
  }

  async search(req: Request, res: Response) {
    const query = req.body.query.toString() || '';
    const result = await this.service.search(query, res.locals.owner);
    res.json(result);
  }

  async getNotionLink(_req: Request, res: Response) {
    console.debug('/get-notion-link');
    const clientId = this.service.getClientId();

    if (!clientId) {
      return res.status(400).send();
    }

    const linkInfo = await this.service.getNotionLinkInfo(res.locals.owner);
    return res.status(200).send(linkInfo);
  }

  async convert(req: Request, res: Response) {
    const api = await this.service.getNotionAPI(res.locals.owner);
    const { id, title } = req.body;

    if (!id) {
      return res.status(400).send({ error: 'id is required' });
    }

    return performConversion(getDatabase(), {
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
    const api = await this.service.getNotionAPI(res.locals.owner);
    const page = await api.getPage(id.replace(/-/g, ''));
    return res.json(page);
  }

  async getBlocks(req: Request, res: Response) {
    const api = await this.service.getNotionAPI(res.locals.owner);
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
    const api = await this.service.getNotionAPI(res.locals.owner);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.getBlock(id);
    res.json(block);
  }

  async createBlock(req: Request, res: Response) {
    const api = await this.service.getNotionAPI(res.locals.owner);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.createBlock(id, req.body.newBlock);
    res.json(block);
  }

  async deleteBlock(req: Request, res: Response) {
    const api = await this.service.getNotionAPI(res.locals.owner);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const block = await api.deleteBlock(id);
    return res.json(block);
  }

  async renderBlock(req: Request, res: Response) {
    const { id } = req.params;
    if (!this.service.isValidUUID(id)) {
      return res.status(400).send();
    }
    const query = id.replace(/-/g, '');
    const api = await this.service.getNotionAPI(res.locals.owner);
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
    if (!this.service.isValidUUID(id)) {
      return res.status(400).send();
    }
    try {
      const database = await this.service.getNotionDatabaseBlock(
        id,
        res.locals.owner
      );
      return res.json(database);
    } catch (error) {
      sendError(error);
      res.status(500).send();
    }
  }

  async queryDatabase(req: Request, res: Response) {
    const api = await this.service.getNotionAPI(res.locals.owner);
    const { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    const results = await api.queryDatabase(id);
    res.json(results);
  }
}

export default NotionController;
