import axios from "axios";

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-logo-favicon")(),
  require("metascraper-title")(),
  require("metascraper-url")(),
]);

export interface Metadata {
  description: string;
  title: string;
  logo: string;
  image: string;
}

export default async function useMetadata(url: string): Promise<Metadata> {
  try {
    let response = await axios.get(url);
    return metascraper({ html: response.data, url: url });
  } catch (error) {
    return {
      description: "",
      title: new URL(url).hostname,
      logo: "",
      image: "",
    };
  }
}
