import axios from "axios";

import NotionObject from "./interfaces/NotionObject";
import UserUpload from "./interfaces/UserUpload";
import UserJob from "./interfaces/UserJob";

class Backend {
  baseURL: string;
  lastCall = new Date();

  constructor() {
    this.baseURL = "/";
  }
  async logout() {
    localStorage.clear();
    const endpoint = this.baseURL + "users/logout";
    await axios.get(endpoint, { withCredentials: true });
    window.location.href = "/";
  }
  getNotionConnectionInfo() {
    console.log("Get", this.baseURL + "notion/get-notion-link");
    return axios.get(this.baseURL + "notion/get-notion-link");
  }

  __getObjectTitle(p): string {
    try {
      const properties = p.properties;
      // Database
      if (p.object === "database" && p.title) {
        return p.title.map((text) => text.plain_text).join("");
      }
      if (!properties) {
        return "untitled";
      }
      if (properties.title) {
        return properties.title.title[0].plain_text as string;
      }
      let desc = properties.Description;
      if (desc) {
        if (Array.isArray(desc.title) && desc.title.length > 0) {
          return desc.title[0].plain_text as string;
        } else if (Array.isArray(desc.rich_text) && desc.rich_text.length > 0) {
          return desc.rich_text[0].plain_text;
        }
      }
      if (properties.Name) {
        return properties.Name.title[0].plain_text;
      }

      const props = Object.keys(properties);
      for (const k of props) {
        let propValue = properties[k];
        if (propValue && Array.isArray(propValue)) {
          return properties[k].title[0].plain_text;
        } else if (propValue && propValue.title) {
          return propValue.title[0].text.content;
        }
      }
    } catch (error) {
      return "untitled";
    }
    return "untitled";
  }

  __withinThreeSeconds(): Boolean {
    const end = new Date();
    console.log("end", end);
    console.log("lastCall", this.lastCall);
    /* @ts-ignore */
    let diff = end - this.lastCall;
    diff /= 1000;
    let seconds = Math.round(diff);
    console.log("seconds since last", seconds);
    if (seconds <= 3) {
      return true;
    }
    this.lastCall = new Date();
    return false;
  }

  saveSettings(settings: { object_id: string; payload: any }) {
    return axios.post(
      this.baseURL + "settings/create/" + settings.object_id,
      { settings },
      { withCredentials: true }
    );
  }

  getSettings(id: string) {
    return axios.get(this.baseURL + "settings/find/" + id);
  }

  saveRules(
    id: string,
    flashcard: string[],
    deck: string,
    subDecks: string,
    tags: string
  ) {
    let payload = {
      FLASHCARD: flashcard.join(","),
      DECK: deck,
      SUB_DECKS: subDecks,
      TAGS: tags,
    };
    return axios.post(
      this.baseURL + "rules/create/" + id,
      { payload },
      { withCredentials: true }
    );
  }

  getRules(id: string) {
    return axios.get(this.baseURL + "rules/find/" + id);
  }

  deleteSettings(pageId: string) {
    return axios.post(
      this.baseURL + "settings/delete/" + pageId,
      { object_id: pageId },
      { withCredentials: true }
    );
  }

  async search(query: string, force?: boolean): Promise<NotionObject[]> {
    if (!force && this.__withinThreeSeconds()) {
      throw new Error(
        "You are making too many requests. Please wait a few seconds before searching."
      );
    }

    // TODO: handel query is a external page (not Notion.so)
    // TODO: handle AnkiWeb urls

    const isObjectId = query.replace(/-/g, "").length === 32;
    let data;
    if (isObjectId) {
      const res = await this.getPage(query);
      console.log("res", res);
      if (res && res.data) {
        data = {
          results: [res.data],
        };
      } else {
        const dbResult = await this.getDatabase(query);
        data = {
          results: [dbResult.data],
        };
      }
    } else {
      const response = await axios.post(
        this.baseURL + "notion/pages",
        { query },
        { withCredentials: true }
      );
      data = response.data;
    }

    if (data && data.results) {
      return data.results.map((p) => {
        return {
          object: p.object,
          title: this.__getObjectTitle(p).substr(0, 58), // Don't show strings longer than 60 characters
          icon: this.__getObjectIcon(p),
          url: p.url as string,
          id: p.id,
        };
      });
    }
    return [];
  }
  private __getObjectIcon(p: any): string {
    if (!p || !p.icon) {
      return "📄";
    }
    const iconType = p.icon.type;
    if (iconType === "emoji") return p.icon.emoji as string;
    if (iconType === "external") {
      return p.icon.external.url;
    }
    return "📄";
  }

  async getPage(pageId: string): Promise<NotionObject | null> {
    try {
      const response = await axios.get(this.baseURL + "notion/page/" + pageId, {
        withCredentials: true,
      });
      return {
        object: response.data.object,
        title: this.__getObjectTitle(response.data),
        icon: this.__getObjectIcon(response.data),
        url: response.data.url as string,
        id: response.data.id,
        data: response.data,
      };
    } catch (error) {
      return null;
    }
  }

  async getDatabase(id: string): Promise<NotionObject | null> {
    try {
      const response = await axios.get(this.baseURL + "notion/database/" + id, {
        withCredentials: true,
      });
      return {
        object: response.data.object,
        title: this.__getObjectTitle(response.data),
        icon: this.__getObjectIcon(response.data),
        url: response.data.url as string,
        id: response.data.id,
        data: response.data,
      };
    } catch (error) {
      return null;
    }
  }

  // TODO: typeset!
  async getBlocks(pageId: string): Promise<any> {
    const response = await axios.get(this.baseURL + "notion/blocks/" + pageId, {
      withCredentials: true,
    });
    return response.data;
  }

  async getUploads(): Promise<UserUpload[]> {
    const response = await axios.get(this.baseURL + "upload/mine", {
      withCredentials: true,
    });
    return response.data;
  }

  async getActiveJobs(): Promise<UserJob[]> {
    const response = await axios.get(this.baseURL + "upload/active", {
      withCredentials: true,
    });
    return response.data;
  }

  async deleteUpload(id: string): Promise<Boolean> {
    try {
      await axios.delete(this.baseURL + "upload/mine/" + id, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteJob(id: string) {
    await axios.delete(this.baseURL + "upload/active/" + id, {
      withCredentials: true,
    });
  }

  async convert(id: string, type: string) {
    const link = `${this.baseURL}notion/convert/${id}?type=${type}`;
    return axios.get(link, { withCredentials: true });
  }

  async isPatreon(): Promise<boolean> {
    const response = await axios.get(this.baseURL + "users/is-patreon", {
      withCredentials: true,
    });
    return response.data.patreon;
  }
}

export default Backend;
