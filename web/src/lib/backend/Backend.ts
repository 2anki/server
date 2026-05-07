import Cookies from 'universal-cookie';

import { getNotionObjectTitle } from 'get-notion-object-title';
import { 
  NotionDatabase, 
  NotionPage 
} from '../../generated/data-contracts';
import NotionObject from '../interfaces/NotionObject';
import UserUpload from '../interfaces/UserUpload';
import AnkifyClient from '../interfaces/AnkifyClient';

import { JobsId } from '../../schemas/public/Jobs';
import JobResponse from '../../schemas/public/JobResponse';
import { ConnectionInfo } from '../interfaces/ConnectionInfo';
import isOfflineMode from '../isOfflineMode';
import getObjectIcon, { ObjectIcon } from '../notion/getObjectIcon';
import { Rules, Settings } from '../types';
import { del, get, getLoginURL, post } from './api';
import { getResourceUrl } from './getResourceUrl';
import { CONFLICT, OK } from './http';

export class TrackerSchemaError extends Error {
  readonly missing: string[];

  constructor(message: string, missing: string[]) {
    super(message);
    this.name = 'TrackerSchemaError';
    this.missing = missing;
  }
}

export class Backend {
  public baseURL = '/api/';

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
    globalThis.location.href = '/';
  }

  async getNotionConnectionInfo(): Promise<ConnectionInfo> {
    return get(`${this.baseURL}notion/get-notion-link`);
  }

  saveSettings(settings: Settings) {
    return post(`${this.baseURL}settings/create/${settings.object_id}`, {
      settings,
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
      EMAIL_NOTIFICATION: email,
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
      console.error('getRules failed, falling back to empty rule', error);
      return null;
    }
  }

  deleteSettings(pageId: string) {
    return post(`${this.baseURL}settings/delete/${pageId}`, {
      object_id: pageId,
    });
  }

  async search(query: string): Promise<NotionObject[]> {
    const favorites = await this.getFavorites();

    const isObjectId = query.replaceAll('-', '').length === 32;
    let data;
    if (isObjectId) {
      const res = await this.getPage(query);
      if (res?.data) {
        data = {
          results: [res.data],
        };
      } else {
        const dbResult = await this.getDatabase(query);
        if (dbResult?.data) {
          data = {
            results: [dbResult.data],
          };
        }
      }
    } else {
      const response = await post(`${this.baseURL}notion/pages`, { query });
      data = await response.json();
    }

    if ('message' in data) {
      throw new Error(data.message);
    }

    if (data?.results) {
      return data.results.map((p: NotionDatabase | NotionPage) => ({
        object: p.object,
        title: getNotionObjectTitle(p, { emoji: false }),
        icon: getObjectIcon(p as ObjectIcon),
        url: getResourceUrl(p),
        id: p.id,
        isFavorite: favorites.some((f) => f.id === p.id),
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
      title: getNotionObjectTitle(data, { emoji: false }),
      icon: getObjectIcon(data),
      url: data.url as string,
      id: data.id,
      data,
      isFavorite,
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
      title: getNotionObjectTitle(data, { emoji: false }),
      icon: getObjectIcon(data),
      url: data.url as string,
      id: data.id,
      data,
      isFavorite,
    };
  }

  async getUploads(): Promise<UserUpload[]> {
    return get(`${this.baseURL}upload/mine`);
  }

  async getJobs(): Promise<JobResponse[]> {
    return get(`${this.baseURL}upload/jobs`);
  }

  /**
   * Tell the backend that user wants to delete this upload.
   * @param key upload key to delete
   * @returns whether the deletion was successful or throws an error
   */
  deleteUpload(key: string): Promise<Response | null> {
    return del(`${this.baseURL}upload/mine/${key}`);
  }

  async deleteJob(id: JobsId) {
    const response = await del(`${this.baseURL}upload/jobs/${id}`);
    if (response && !response.ok) {
      if (response.status === CONFLICT) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Cannot delete job while it is in progress'
        );
      }
      throw new Error(
        `Failed to delete job: ${response.status} ${response.statusText}`
      );
    }
  }

  async restartClaudeJob(jobId: string) {
    return post(`${this.baseURL}upload/jobs/${jobId}/restart`, {});
  }

  async convert(id: string, type: string | null, title: string | null) {
    const link = `${this.baseURL}notion/convert`;
    return post(link, { id, type, title });
  }

  async addFavorite(id: string, type: string | null): Promise<boolean> {
    const response = await post(`${this.baseURL}favorite/create`, { id, type });
    return response.status === OK;
  }

  async deleteFavorite(id: string): Promise<boolean> {
    const response = await post(`${this.baseURL}favorite/remove`, { id });
    return response.status === OK;
  }

  async getFavorites(): Promise<NotionObject[]> {
    try {
      const favorites = await get(`${this.baseURL}favorite`, {
        redirect: false,
      });
      return favorites.map((f: NotionDatabase | NotionPage) => ({
        object: f,
        title: getNotionObjectTitle(f, { emoji: false }),
        icon: getObjectIcon(f as ObjectIcon),
        url: getResourceUrl(f),
        id: f.id,
        data: f,
        isFavorite: true,
      }));
    } catch (error) {
      console.error('getFavorites failed', error);
      return [];
    }
  }

  async login(email: string, password: string): Promise<Response> {
    return post(`${getLoginURL(this.baseURL)}${globalThis.location.search}`, {
      email,
      password,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const endpoint = `${this.baseURL}users/forgot-password`;
    await post(endpoint, { email });
  }

  async newPassword(password: string, token: string): Promise<Response> {
    return post(`${this.baseURL}users/new-password`, {
      password,
      reset_token: token,
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

  async listAnkifyClients(): Promise<AnkifyClient[]> {
    const result = await get(`${this.baseURL}ankify/clients`);
    return result ?? [];
  }

  async provisionAnkifyClient(): Promise<AnkifyClient> {
    const response = await post(`${this.baseURL}ankify/clients`, {});
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to provision client');
    }
    return response.json();
  }

  async stopAnkifyClient(id: number): Promise<void> {
    const response = await del(`${this.baseURL}ankify/clients/${id}`);
    if (response == null || !response.ok) {
      throw new Error('Failed to stop client');
    }
  }

  async respinAnkifyClient(): Promise<AnkifyClient> {
    const response = await post(`${this.baseURL}ankify/clients/respin`, {});
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to respin client');
    }
    return response.json();
  }

  async getAnkifyExportSchedule(): Promise<{
    id: number;
    owner: number;
    database_id: string;
    time_of_day: string;
    timezone: string;
    date_range_days: number | null;
    enabled: boolean;
    last_run_at: string | null;
  } | null> {
    const result = await get(`${this.baseURL}ankify/exports/schedule`);
    return result ?? null;
  }

  async configureAnkifyExportSchedule(input: {
    databaseId: string;
    timeOfDay: string;
    timezone: string;
    dateRangeDays?: number | null;
    enabled: boolean;
  }): Promise<void> {
    const response = await post(`${this.baseURL}ankify/exports/schedule`, {
      database_id: input.databaseId,
      time_of_day: input.timeOfDay,
      timezone: input.timezone,
      date_range_days: input.dateRangeDays ?? null,
      enabled: input.enabled,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to configure schedule');
    }
  }

  async deleteAnkifyExportSchedule(): Promise<void> {
    const response = await del(`${this.baseURL}ankify/exports/schedule`);
    if (response == null || !response.ok) {
      throw new Error('Failed to delete schedule');
    }
  }

  async listAnkifySubscriptions(): Promise<
    Array<{
      id: number;
      notion_page_id: string;
      enabled: boolean;
      last_polled_at: string | null;
      last_synced_at: string | null;
      last_error: string | null;
    }>
  > {
    const result = await get(`${this.baseURL}ankify/subscriptions`);
    return result ?? [];
  }

  async subscribeAnkifyNotionPage(notionPageId: string): Promise<{
    created: number;
    updated: number;
    conflicts: number;
    unchanged: number;
    errors: string[];
    anki_web_sync: 'synced' | 'failed' | 'skipped';
    anki_web_sync_error: string | null;
  }> {
    const response = await post(`${this.baseURL}ankify/subscriptions`, {
      notion_page_id: notionPageId,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to subscribe page');
    }
    return response.json();
  }

  async deleteAnkifySubscription(id: number): Promise<void> {
    const response = await del(
      `${this.baseURL}ankify/subscriptions/${id}`
    );
    if (response == null || !response.ok) {
      throw new Error('Failed to delete subscription');
    }
  }

  async listAnkifyConflicts(): Promise<
    Array<{
      id: number;
      source_id: string;
      anki_note_id: number;
      kind: string;
      notion_snapshot: { front?: string; back?: string } | null;
      anki_snapshot: { front?: string; back?: string } | null;
      created_at: string;
    }>
  > {
    const result = await get(
      `${this.baseURL}ankify/conflicts?status=pending`
    );
    return result ?? [];
  }

  async resolveAnkifyConflict(
    id: number,
    resolution: 'keep_notion' | 'keep_anki' | 'dismissed'
  ): Promise<void> {
    const response = await post(
      `${this.baseURL}ankify/conflicts/${id}/resolve`,
      { resolution }
    );
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to resolve conflict');
    }
  }

  async checkAnkifyActiveClientReady(): Promise<{
    ready: boolean;
    reason?: 'no_active_client' | 'unreachable' | 'error';
    detail?: string;
  }> {
    const result = await get(`${this.baseURL}ankify/clients/active/ready`);
    return result ?? { ready: false, reason: 'unreachable' };
  }

  async listAnkifyNotionDatabases(): Promise<
    Array<{
      id: string;
      title: string;
      url: string | null;
      has_review_shape: boolean;
    }>
  > {
    const result = await get(`${this.baseURL}ankify/notion/databases`);
    return result ?? [];
  }

  async createAnkifyReviewTracker(input: {
    parentPageId: string;
    title?: string;
  }): Promise<{ id: string; url: string | null; title: string }> {
    const response = await post(`${this.baseURL}ankify/notion/databases`, {
      parent_page_id: input.parentPageId,
      title: input.title,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to create tracker database');
    }
    return response.json();
  }

  async exportAnkifyReviewData(input: {
    databaseId: string;
    dateRangeDays?: number;
  }): Promise<{
    exported: number;
    skipped: number;
    errors: string[];
    totalDays: number;
  }> {
    const response = await post(`${this.baseURL}ankify/exports/review-data`, {
      database_id: input.databaseId,
      date_range_days: input.dateRangeDays,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      if (response.status === 422 && Array.isArray(error.missing)) {
        throw new TrackerSchemaError(
          error.message ?? 'Tracker is missing required columns',
          error.missing as string[]
        );
      }
      throw new Error(error.message ?? 'Failed to export review data');
    }
    return response.json();
  }

  async dispatchUploadToAnkify(uploadId: number): Promise<{
    deck_names: string[];
    created: number;
    updated: number;
    errors: string[];
    anki_web_sync: 'synced' | 'failed' | 'skipped';
    anki_web_sync_error: string | null;
  }> {
    const response = await post(`${this.baseURL}ankify/dispatch`, {
      upload_id: uploadId,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message ?? 'Failed to dispatch upload');
    }
    return response.json();
  }
}
