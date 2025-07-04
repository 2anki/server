import { Request, Response } from 'express';

import performConversion from '../lib/storage/jobs/helpers/performConversion';
import CardOption from '../lib/parser/Settings';
import BlockHandler from '../services/NotionService/BlockHandler/BlockHandler';
import CustomExporter from '../lib/parser/exporters/CustomExporter';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Workspace from '../lib/parser/WorkSpace';
import { blockToStaticMarkup } from '../services/NotionService/helpers/blockToStaticMarkup';
import NotionService from '../services/NotionService';
import { getDatabase } from '../data_layer';
import { getNotionId } from '../services/NotionService/getNotionId';
import { getOwner } from '../lib/User/getOwner';
import { APIErrorCode, APIResponseError } from '@notionhq/client';
import sendErrorResponse from '../lib/sendErrorResponse';
import { isPaying } from '../lib/isPaying';

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
      console.info('Connect to Notion failed');
      console.error(err);
      return res.redirect('/search');
    }
  }

  async search(req: Request, res: Response) {
    try {
      // Check for Notion connection first
      const linkInfo = await this.service.getNotionLinkInfo(res.locals.owner);
      if (!linkInfo.isConnected) {
        const renewalLink = this.service.getNotionAuthorizationLink(
          this.service.getClientId()
        );
        return res.status(401).json({
          message: `Notion is not connected. Please connect your account <a href='${renewalLink}'>here</a>.`,
        });
      }

      // Proceed with search if connected
      const query = req.body.query.toString() || '';
      const result = await this.service.search(query, getOwner(res));
      res.json(result);
    } catch (err) {
      if (err instanceof APIResponseError) {
        if (err.code === APIErrorCode.Unauthorized) {
          const renewalLink = this.service.getNotionAuthorizationLink(
            this.service.getClientId()
          );
          err.message += `You can renew it <a href='${renewalLink}'>here</a>.`;
        }
        sendErrorResponse(err, res);
      }
    }
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
    const { id, title, type } = req.body;

    if (!id) {
      return res.status(400).send({ error: 'id is required' });
    }

    return performConversion(getDatabase(), {
      api,
      id,
      type,
      owner: res.locals.owner,
      res,
      title: title ?? 'Untitled',
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
      all: isPaying(res.locals),
      createdAt: '',
      lastEditedAt: '',
      id,
      type: 'page',
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
    const settings = new CardOption(CardOption.LoadDefaultOptions());
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
      console.info('Get database failed');
      console.error(error);
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

  async disconnect(_req: Request, res: Response) {
    try {
      const deletion = await this.service.disconnect(res.locals.owner);
      res.status(200).send({ didDelete: deletion });
    } catch (err) {
      console.info('Disconnect from Notion failed');
      console.error(err);
      res.status(500).send({ didDelete: false });
    }
  }
}

export default NotionController;
