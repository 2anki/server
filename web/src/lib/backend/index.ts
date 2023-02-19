import Cookies from 'universal-cookie';

import {
  GetDatabaseResponse,
  GetPageResponse
} from '@notionhq/client/build/src/api-endpoints';
import NotionObject from '../interfaces/NotionObject';
import UserUpload from '../interfaces/UserUpload';

import getObjectIcon, { ObjectIcon } from '../notion/getObjectIcon';
import getObjectTitle from '../notion/getObjectTitle';
import isOfflineMode from '../isOfflineMode';
import { Rules, Settings } from '../types';
import { ConnectionInfo } from '../interfaces/ConnectionInfo';
import { del, get, getLoginURL, post } from './api';
import { getResourceUrl } from './getResourceUrl';
import { OK } from './http';
import Jobs, { JobsId } from '../../schemas/public/Jobs';

class Backend {
  baseURL: string;

  constructor() {
    this.baseURL = '/api/';
  }

  async logout() {
    const isOffline = isOfflineMode();
    localStorage.clear();
    sessionStorage.clear();
    if (!isOffline) {
      const endpoint = `${this.baseURL}users/logout`;
      await post(endpoint, {});
    }
    const cookies = new Cookies();
    cookies.remove('token');
    window.location.href = '/';
  }

  async getNotionConnectionInfo(): Promise<ConnectionInfo> {
    return get(`${this.baseURL}notion/get-notion-link`);
  }

  saveSettings(settings: Settings) {
    return post(`${this.baseURL}settings/create/${settings.object_id}`, {
      settings
    });
  }

  async getSettings(id: string): Promise<Settings['payload'] | null> {
    const result = await get(`${this.baseURL}settings/find/${id}`);
    if (!result) {
      return null;
    }
    return result.payload;
  }

  saveRules(
    id: string,
    flashcard: string[],
    deck: string[],
    subDecks: string[],
    tags: string,
    email: boolean
  ) {
    const payload = {
      FLASHCARD: flashcard.join(','),
      DECK: deck.join(','),
      SUB_DECKS: subDecks.join(','),
      TAGS: tags,
      EMAIL_NOTIFICATION: email
    };
    return post(`${this.baseURL}rules/create/${id}`, { payload });
  }

  async getRules(id: string): Promise<Rules | null> {
    try {
      const findRules = async () => get(`${this.baseURL}rules/find/${id}`);
      const result = await findRules();
      if (!result) {
        return null;
      }
      return result;
    } catch (error) {
      // Fallback to empty rule
      return null;
    }
  }

  deleteSettings(pageId: string) {
    return post(`${this.baseURL}settings/delete/${pageId}`, {
      object_id: pageId
    });
  }

  async search(query: string): Promise<NotionObject[]> {
    const favorites = await this.getFavorites();

    const isObjectId = query.replace(/-/g, '').length === 32;
    let data;
    if (isObjectId) {
      const res = await this.getPage(query);
      if (res && res.data) {
        data = {
          results: [res.data]
        };
      } else {
        const dbResult = await this.getDatabase(query);
        if (dbResult && dbResult.data) {
          data = {
            results: [dbResult.data]
          };
        }
      }
    } else {
      const response = await post(`${this.baseURL}notion/pages`, { query });
      data = await response.json();
    }

    if (data && data.results) {
      return data.results.map((p: GetDatabaseResponse | GetPageResponse) => ({
        object: p.object,
        title: getObjectTitle(p).slice(0, 58), // Don't show strings longer than 60 characters
        icon: getObjectIcon(p as ObjectIcon),
        url: getResourceUrl(p),
        id: p.id,
        isFavorite: favorites.some((f) => f.id === p.id)
      }));
    }
    return [];
  }

  async getPage(
    pageId: string,
    isFavorite: boolean = false
  ): Promise<NotionObject | null> {
    const data = await get(`${this.baseURL}notion/page/${pageId}`);
    return {
      object: data.object,
      title: getObjectTitle(data),
      icon: getObjectIcon(data),
      url: data.url as string,
      id: data.id,
      data,
      isFavorite
    };
  }

  async getDatabase(
    id: string | undefined,
    isFavorite: boolean = false
  ): Promise<NotionObject | null> {
    if (!id) {
      throw new Error('No id provided');
    }

    const data = await get(`${this.baseURL}notion/database/${id}`);
    return {
      object: data.object,
      title: getObjectTitle(data),
      icon: getObjectIcon(data),
      url: data.url as string,
      id: data.id,
      data,
      isFavorite
    };
  }

  async getUploads(): Promise<UserUpload[]> {
    return get(`${this.baseURL}upload/mine`);
  }

  async getJobs(): Promise<Jobs[]> {
    return get(`${this.baseURL}upload/jobs`);
  }

  /**
   * Tell the backend that user wants to delete this upload.
   * @param key upload key to delete
   * @returns whether the deletion was successful or throws an error
   */
  deleteUpload(key: string): Promise<Response> {
    return del(`${this.baseURL}upload/mine/${key}`);
  }

  async deleteJob(id: JobsId) {
    await del(`${this.baseURL}upload/jobs/${id}`);
  }

  async convert(id: string, type: string, title: string | null) {
    const link = `${this.baseURL}notion/convert`;
    return post(link, { id, type, title });
  }

  async isPatreon(): Promise<boolean> {
    const data = await get(`${this.baseURL}users/is-patreon`);
    return data?.patreon ?? false;
  }

  async addFavorite(id: string, type: string): Promise<boolean> {
    const response = await post(`${this.baseURL}favorite/create`, { id, type });
    return response.status === OK;
  }

  async deleteFavorite(id: string): Promise<boolean> {
    const response = await post(`${this.baseURL}favorite/remove`, { id });
    return response.status === OK;
  }

  async getFavorites(): Promise<NotionObject[]> {
    const favorites = await get(`${this.baseURL}favorite`);
    return favorites.map((f: GetDatabaseResponse | GetPageResponse) => ({
      object: f,
      title: getObjectTitle(f),
      icon: getObjectIcon(f as ObjectIcon),
      url: getResourceUrl(f),
      id: f.id,
      data: f,
      isFavorite: true
    }));
  }

  async login(email: string, password: string): Promise<Response> {
    return post(getLoginURL(this.baseURL), {
      email,
      password
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const endpoint = `${this.baseURL}users/forgot-password`;
    await post(endpoint, { email });
  }

  async newPassword(password: string, token: string): Promise<Response> {
    return post(`${this.baseURL}users/new-password`, {
      password,
      reset_token: token
    });
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<Response> {
    const endpoint = `${this.baseURL}users/register`;
    return post(endpoint, { name, email, password });
  }

  async deleteAccount(confirmed: boolean): Promise<Response> {
    return post(`${this.baseURL}users/delete-account`, { confirmed });
  }
}

export default Backend;
