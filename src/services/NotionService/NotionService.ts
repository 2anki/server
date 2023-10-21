import axios from 'axios';

import { INotionRepository } from '../../data_layer/NotionRespository';
import { sendError } from '../../lib/error/sendError';
import hashToken from '../../lib/misc/hashToken';
import NotionAPIWrapper from './NotionAPIWrapper';
import { getNotionId } from './getNotionId';

export interface NotionLinkInfo {
  link: string;
  isConnected: boolean;
  workspace: string | null;
}

export class NotionService {
  clientId: string;

  clientSecret: string;

  redirectURI: string;

  constructor(private notionRepository: INotionRepository) {
    this.clientId = process.env.NOTION_CLIENT_ID!;
    this.clientSecret = process.env.NOTION_CLIENT_SECRET!;
    this.redirectURI = process.env.NOTION_REDIRECT_URI!;
  }

  getNotionAuthorizationLink(clientId: string) {
    return `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&response_type=code`;
  }

  isValidUUID(id: string | undefined | null) {
    if (!id) {
      return false;
    }

    const regex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    return regex.exec(id);
  }

  getNotionAPI = async (owner: string): Promise<NotionAPIWrapper> => {
    const token = await this.notionRepository.getNotionToken(owner);
    return new NotionAPIWrapper(token!, owner);
  };

  async getNotionDatabaseBlock(id: string, owner: string) {
    let cleanId = id.replace(/-/g, '');

    if (cleanId.includes('/')) {
      cleanId = getNotionId(id) ?? cleanId;
    }

    const client = await this.getNotionAPI(owner);

    return client.getDatabase(cleanId);
  }

  async search(query: string, owner: string) {
    const client = await this.getNotionAPI(owner);
    return client.search(query);
  }

  async connectToNotion(authorizationCode: string, owner: number) {
    const accessData = await this.getAccessData(authorizationCode.toString());
    await this.notionRepository.saveNotionToken(owner, accessData, hashToken);
  }

  async getNotionLinkInfo(owner: number): Promise<NotionLinkInfo> {
    const notionData = await this.notionRepository.getNotionData(owner);
    const clientId = this.clientId;
    const link = this.getNotionAuthorizationLink(clientId);

    if (!notionData) {
      return {
        link,
        isConnected: false,
        workspace: null,
      };
    }

    return {
      link,
      isConnected: !!notionData.token,
      workspace: notionData.workspace_name,
    };
  }

  getAccessData(code: string): Promise<{ [key: string]: string }> {
    const uri = this.redirectURI;
    const id = this.clientId;
    const secret = this.clientSecret;

    if (!uri || !id || !secret) {
      throw new Error('Notion Connection Handler not configured');
    }

    return new Promise(async (resolve, reject) => {
      const url = 'https://api.notion.com/v1/oauth/token';
      const data = {
        grant_type: 'authorization_code',
        code,
      };
      const options = {
        auth: {
          username: id,
          password: secret,
        },
        headers: { 'Content-Type': 'application/json' },
      };

      try {
        const res = await axios.post(url, data, options);
        if (res.data.access_token) {
          resolve(res.data);
        }
      } catch (err) {
        sendError(err);
        reject(err);
      }
    });
  }

  purgeBlockCache(owner: number) {
    return this.notionRepository.deleteBlocksByOwner(owner);
  }

  getClientId() {
    return this.clientId;
  }
}
