import axios from 'axios';

import NotionObject from './interfaces/NotionObject';
import UserUpload from './interfaces/UserUpload';
import UserJob from './interfaces/UserJob';

import getObjectTitle from './notion/getObjectTitle';
import getObjectIcon from './notion/getObjectIcon';
import FavoriteObject from './interfaces/FavoriteObject';

class Backend {
  baseURL: string;

  lastCall = new Date();

  constructor() {
    this.baseURL = '/';
  }

  async logout() {
    localStorage.clear();
    sessionStorage.clear();
    const endpoint = `${this.baseURL}users/logout`;
    await axios.get(endpoint, { withCredentials: true });
    window.location.href = '/';
  }

  getNotionConnectionInfo() {
    return axios.get(`${this.baseURL}notion/get-notion-link`);
  }

  withinThreeSeconds(): boolean {
    const end = new Date();
    /* @ts-ignore */
    let diff = end - this.lastCall;
    diff /= 1000;
    const seconds = Math.round(diff);
    if (seconds <= 3) {
      return true;
    }
    this.lastCall = new Date();
    return false;
  }

  saveSettings(settings: { object_id: string; payload: any }) {
    return axios.post(
      `${this.baseURL}settings/create/${settings.object_id}`,
      { settings },
      { withCredentials: true },
    );
  }

  getSettings(id: string) {
    return axios.get(`${this.baseURL}settings/find/${id}`);
  }

  saveRules(
    id: string,
    flashcard: string[],
    deck: string,
    subDecks: string,
    tags: string,
    email: boolean,
  ) {
    const payload = {
      FLASHCARD: flashcard.join(','),
      DECK: deck,
      SUB_DECKS: subDecks,
      TAGS: tags,
      EMAIL_NOTIFICATION: email,
    };
    return axios.post(
      `${this.baseURL}rules/create/${id}`,
      { payload },
      { withCredentials: true },
    );
  }

  getRules(id: string) {
    return axios.get(`${this.baseURL}rules/find/${id}`);
  }

  deleteSettings(pageId: string) {
    return axios.post(
      `${this.baseURL}settings/delete/${pageId}`,
      { object_id: pageId },
      { withCredentials: true },
    );
  }

  async search(query: string, force?: boolean): Promise<NotionObject[]> {
    if (!force && this.withinThreeSeconds()) {
      throw new Error(
        'You are making too many requests. Please wait a few seconds before searching.',
      );
    }
    const favorites = await this.getFavorites();

    const isObjectId = query.replace(/-/g, '').length === 32;
    let data;
    if (isObjectId) {
      const res = await this.getPage(query);
      if (res && res.data) {
        data = {
          results: [res.data],
        };
      } else {
        const dbResult = await this.getDatabase(query);
        if (dbResult && dbResult.data) {
          data = {
            results: [dbResult.data],
          };
        }
      }
    } else {
      const response = await axios.post(
        `${this.baseURL}notion/pages`,
        { query },
        { withCredentials: true },
      );
      data = response.data;
    }

    if (data && data.results) {
      return data.results.map((p) => ({
        object: p.object,
        title: getObjectTitle(p).slice(0, 58), // Don't show strings longer than 60 characters
        icon: getObjectIcon(p),
        url: p.url as string,
        id: p.id,
        isFavorite: favorites.some((f) => f.id === p.id),
      }));
    }
    return [];
  }

  async getPage(
    pageId: string,
    isFavorite: boolean = false,
  ): Promise<NotionObject | null> {
    try {
      const response = await axios.get(`${this.baseURL}notion/page/${pageId}`, {
        withCredentials: true,
      });
      return {
        object: response.data.object,
        title: getObjectTitle(response.data),
        icon: getObjectIcon(response.data),
        url: response.data.url as string,
        id: response.data.id,
        data: response.data,
        isFavorite,
      };
    } catch (error) {
      return null;
    }
  }

  async getDatabase(
    id: string,
    isFavorite: boolean = false,
  ): Promise<NotionObject | null> {
    try {
      const response = await axios.get(`${this.baseURL}notion/database/${id}`, {
        withCredentials: true,
      });
      return {
        object: response.data.object,
        title: getObjectTitle(response.data),
        icon: getObjectIcon(response.data),
        url: response.data.url as string,
        id: response.data.id,
        data: response.data,
        isFavorite,
      };
    } catch (error) {
      return null;
    }
  }

  async getBlocks(pageId: string): Promise<any> {
    const response = await axios.get(`${this.baseURL}notion/blocks/${pageId}`, {
      withCredentials: true,
    });
    return response.data;
  }

  async getUploads(): Promise<UserUpload[]> {
    const response = await axios.get(`${this.baseURL}upload/mine`, {
      withCredentials: true,
    });
    return response.data;
  }

  async getActiveJobs(): Promise<UserJob[]> {
    const response = await axios.get(`${this.baseURL}upload/active`, {
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Tell the backend that user wants to delete this upload.
   * @param key upload key to delete
   * @returns whether the deletion was successful or throws an error
   */
  async deleteUpload(key: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}upload/mine/${key}`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteJob(id: string) {
    await axios.delete(`${this.baseURL}upload/active/${id}`, {
      withCredentials: true,
    });
  }

  async convert(id: string, type: string) {
    const link = `${this.baseURL}notion/convert/${id}?type=${type}`;
    return axios.get(link, { withCredentials: true });
  }

  async isPatreon(): Promise<boolean> {
    const response = await axios.get(`${this.baseURL}users/is-patreon`, {
      withCredentials: true,
    });
    return response.data.patreon;
  }

  async addFavorite(id: string, type: string): Promise<boolean> {
    return axios.post(
      `${this.baseURL}favorite/create`,
      { id, type },
      {
        withCredentials: true,
      },
    );
  }

  async deleteFavorite(id: string): Promise<boolean> {
    return axios.post(
      `${this.baseURL}favorite/remove`,
      { id },
      {
        withCredentials: true,
      },
    );
  }

  async getFavorites(): Promise<NotionObject[]> {
    const response = await axios.get(`${this.baseURL}favorite`, {
      withCredentials: true,
    });
    const getObject = (f: FavoriteObject) => (f.type === 'page'
      ? this.getPage(f.object_id, true)
      : this.getDatabase(f.object_id, true));
    return Promise.all(response.data.map(async (f) => getObject(f)));
  }
}

export default Backend;
