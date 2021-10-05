import axios from "axios";

// TODO: throttle if it's been 3s since last time for all API requests
class Backend {
  async logout() {
    localStorage.removeItem("token");
    const endpoint = "/users/logout";
    /* @ts-ignore */
    await axios.get(endpoint, { withCredentials: true, credentials: true });
    window.location.href = "/";
  }
  getNotionConnectionInfo() {
    return axios.get("/notion/get-notion-link");
  }
  async search(query: string) {
    const response = axios.post("/notion/pages", { query });
    let results = [];
    return results;
  }
}

export default Backend;
