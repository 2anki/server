import axios from "axios";

import NotionPage from "./interfaces/NotionPage";

// TODO: throttle if it's been 3s since last time for all API requests
class Backend {
  baseURL: string;
  lastCall = new Date();

  constructor() {
    this.baseURL = "/";
  }
  async logout() {
    localStorage.removeItem("token");
    const endpoint = this.baseURL + "users/logout";
    /* @ts-ignore */
    await axios.get(endpoint, { withCredentials: true, credentials: true });
    window.location.href = "/";
  }
  getNotionConnectionInfo() {
    console.log("Get", this.baseURL + "notion/get-notion-link");
    return axios.get(this.baseURL + "notion/get-notion-link");
  }

  __getPageTitle(p): string {
    if (!p) {
      return "untitled";
    }

    const properties = p.properties;
    if (!properties) {
      return "untitled";
    }
    if (properties.title) {
      return properties.title.title[0].plain_text as string;
    }
    if (properties.Description) {
      return properties.Description.title[0].plain_text as string;
    }
    if (properties.Name) {
      return properties.Name.title[0].plain_text;
    }
    return "untitled";
  }

  __withinThreeSeconds(): Boolean {
    const end = new Date();
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

  async search(query: string): Promise<NotionPage[]> {
    if (this.__withinThreeSeconds()) {
      throw new Error("too fast");
    }

    const response = await axios.post(
      this.baseURL + "notion/pages",
      { query },
      { withCredentials: true }
    );
    let results = [];
    let data = response.data;
    if (data && data.results) {
      results = data.results
        .filter((p) => p.object === "page")
        .map((p) => {
          console.log("p", p);
          let page: NotionPage = {
            title: this.__getPageTitle(p).substr(0, 80), // Don't show strings longer than 80 characters
            icon: this.__getPageIcon(p),
            url: p.url as string,
          };
          return page;
        });
    }
    return results;
  }
  private __getPageIcon(p: any): string {
    if (!p || !p.icon) {
      return "📄";
    }
    if (p.icon && p.icon.emoji) return p.icon.emoji as string;
    return "📄";
  }
}

export default Backend;
