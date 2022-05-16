import { Handler } from "express";
import path from "path";

const search = function ({ distDir }: {
  distDir: string;
}): Handler {
  return function (_req, res) {
    try {
      res.sendFile(path.join(distDir, "index.html"));
    } catch (ex: unknown) {
      console.error("Could not search.", ex);
    }
  }
}

export default search;

