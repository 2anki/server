import axios from "axios";

import NotionPage from "./interfaces/NotionPage";

// TODO: throttle if it's been 3s since last time for all API requests
class Backend {
  baseURL: string;
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

  async search(query: string): Promise<NotionPage[]> {
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
          let page: NotionPage = {
            title: p.properties.title.title[0].plain_text as string,
            icon: p.icon.emoji as string,
            url: p.url as string,
          };
          return page;
        });
    }
    return results;
  }
}

export default Backend;
