import { mkdirSync } from "fs";
import path from "path";
import os from "os";

import findRemoveSync from "find-remove";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import { ALLOWED_ORIGINS } from "./constants";
import ErrorHandler from "./handlers/error";

// Server Endpoints
import * as connectNotion from "./routes/auth/create-key";
import * as checks from "./routes/checks";
import * as version from "./routes/version";
import * as upload from "./routes/upload";
import * as users from "./routes/users";

import DB from "./storage/db";
import config from "./knexfile";
import TokenHandler from "./handlers/TokenHandler";
import CrashReporter from "./lib/CrashReporter";

if (!process.env.WORKSPACE_BASE) {
  process.env.WORKSPACE_BASE = "/tmp/workspace";
  mkdirSync(process.env.WORKSPACE_BASE, { recursive: true });
}

function serve() {
  const templateDir = path.join(__dirname, "templates");
  const distDir = path.join(__dirname, "../web/build");
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  CrashReporter.Configure(app);

  app.use(morgan("combined"));
  app.use("/templates", express.static(templateDir));
  app.use(express.static(distDir));
  app.use("/checks", checks.default);
  app.use("/version", version.default);
  app.use("/auth", connectNotion.default);

  app.get("/dashboard*", async (req, res) => {
    const isValid = await TokenHandler.IsValidJWTToken(req.cookies.token);
    if (isValid) {
      res.sendFile(path.join(distDir, "index.html"));
    } else {
      res.redirect("/login#login");
    }
  });
  app.get("/users/r/:id", async (req, res, next) => {
    try {
      const reset_token = req.params.id;
      const isValid = await TokenHandler.IsValidResetToken(DB, reset_token);
      if (isValid) {
        return res.sendFile(path.join(distDir, "index.html"));
      }
      return res.redirect("/login#login");
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  app.use("/upload", upload.default);
  app.use("/users", users.default);

  // Note: this has to be the last handler
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });

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

  CrashReporter.AddErrorHandler(app);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => ErrorHandler(res, err)
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

  DB.raw("SELECT 1").then(() => {
    console.log("DB is ready");
  });
  let cwd = process.cwd();
  if (process.env.MIGRATIONS_DIR) {
    process.chdir(path.join(process.env.MIGRATIONS_DIR, ".."));
  }
  /* @ts-ignore */
  DB.migrate.latest(config).then(() => {
    process.chdir(cwd);
    process.env.SECRET ||= "victory";
    const port = process.env.PORT || 2020;
    app.listen(port, () => {
      console.log(`🟢 Running on http://localhost:${port}`);
    });
  });
}

serve();
