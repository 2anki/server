import { Handler } from "express";
import { INDEX_FILE } from "./lib/constants";

const search = function (): Handler {
  return function (_req, res) {
    try {
      res.sendFile(INDEX_FILE);
    } catch (ex: unknown) {
      console.error("Could not search.", ex);
    }
  }
}

export default search;

