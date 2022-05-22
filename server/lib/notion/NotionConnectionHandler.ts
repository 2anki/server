import axios from 'axios';

class NotionConnectionHandler {
  clientId: string;

  clientSecret: string;

  redirectURI: string;

  constructor(id: string, secret: string, redirect: string) {
    this.redirectURI = redirect;
    this.clientSecret = secret;
    this.clientId = id;
  }

  static Default() {
    return new NotionConnectionHandler(
      process.env.NOTION_CLIENT_ID!,
      process.env.NOTION_CLIENT_SECRET!,
      process.env.NOTION_REDIRECT_URI!,
    );
  }

  async getAccessData(code: string): Promise<string> {
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
        console.error(err);
        reject(err);
      }
    });
  }
}

export default NotionConnectionHandler;
