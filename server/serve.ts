import { existsSync, mkdirSync } from "fs";
import path from "path";
import os from "os";

import findRemoveSync from "find-remove";
import morgan from "morgan";
import express from "express";

import { ALLOWED_ORIGINS } from "./constants";
import ErrorHandler from "./handlers/error";

// Server Endpoints
import * as connectNotion from "./routes/auth/create-key";
import * as checks from "./routes/checks";
import * as version from "./routes/version";
import * as upload from "./routes/upload";

// Make sure the workspace area exists for processing
const WORKSPACE_BASE = path.join(os.tmpdir(), "workspaces");
if (!process.env.WORKSPACE_BASE) {
  process.env.WORKSPACE_BASE = WORKSPACE_BASE;
}
if (!existsSync(WORKSPACE_BASE)) {
  mkdirSync(WORKSPACE_BASE, { recursive: true });
}

function serve() {
  const templateDir = path.join(__dirname, "templates");
  const distDir = path.join(__dirname, "../web/build");
  const app = express();

  app.use(morgan("combined"));
  app.use("/templates", express.static(templateDir));
  app.use(express.static(distDir));
  app.use("/checks", checks.default);
  app.use("/version", version.default);
  app.use("/auth", connectNotion.default);

  // This is due to legacy stuff and links shared around the web
  const old = ["/notion", "/index", "/upload", "/tm", "/connect-notion"];
  for (const p of old) {
    console.log("setting up request handler for ", p);
    app.get(p, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });

    app.get(`${p}.html`, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.use("/upload", upload.default);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => ErrorHandler(res, err)
  );

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.log(req.originalUrl);
      res.header("Access-Control-Allow-Origin", ALLOWED_ORIGINS.join(","));
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Content-Disposition"
      );
      next();
    }
  );

  process.on("uncaughtException", (err: Error, origin: string) => {
    console.log(
      process.stderr.fd,
      `Caught exception: ${err}\n Exception origin: ${origin}`
    );
  });

  const TweentyOneMinutesInSeconds = 1260;
  setInterval(() => {
    const locations = ["workspaces", "uploads"];
    for (const loc of locations) {
      console.log(`finding & removing ${loc} files older than 21 minutes`);
      const result = findRemoveSync(path.join(os.tmpdir(), loc), {
        files: "*.*",
        age: { seconds: TweentyOneMinutesInSeconds },
      });
      console.log("result", result);
    }
  }, TweentyOneMinutesInSeconds * 1000);

  const port = process.env.PORT || 2020;
  app.listen(port, () => {
    console.log(`🟢 Running on http://localhost:${port}`);
  });
}

module.exports.serve = serve;
