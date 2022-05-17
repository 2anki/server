import { mkdirSync, existsSync } from "fs";
import path from "path";

import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";

import { IsDebug } from "./lib/debug";
if (IsDebug()) {
  const localEnvFile = path.join(__dirname, ".env");
  if (existsSync(localEnvFile)) {
    dotenv.config({ path: localEnvFile });
  }
}

import { ALLOWED_ORIGINS, BUILD_DIR, INDEX_FILE } from "./lib/constants";
import ErrorHandler from "./lib/misc/ErrorHandler";

// Server Endpoints
import _settings from "./routes/settings";
import checks from "./routes/checks";
import version from "./routes/version";
import upload from "./routes/upload";
import users from "./routes/users";
import notion from "./routes/notion";
import rules from "./routes/rules";
import download from "./routes/download/u";
import favorite from "./routes/favorite";

import DB from "./lib/storage/db";
import KnexConfig from "./KnexConfig";
import TokenHandler from "./lib/misc/TokenHandler";
import CrashReporter from "./lib/CrashReporter";
import { ScheduleCleanup } from "./lib/jobs/JobHandler";
import ConversionJob from "./lib/jobs/ConversionJob";
import RequireAuthentication from "./middleware/RequireAuthentication";

if (!process.env.WORKSPACE_BASE) {
  process.env.WORKSPACE_BASE = "/tmp/workspace";
  mkdirSync(process.env.WORKSPACE_BASE, { recursive: true });
}

function serve() {
  const templateDir = path.join(__dirname, "templates");
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  if (process.env.NODE_ENV === "production") {
    CrashReporter.Configure(app);
  }

  if (process.env.SPACES_DEFAULT_BUCKET_NAME !== "dev.2anki.net") {
    app.use(morgan("combined"));
  }

  app.use("/templates", express.static(templateDir));
  app.use(express.static(BUILD_DIR));
  app.use("/checks", checks);
  app.use("/version", version);

  app.get("/search*", RequireAuthentication, async (_req, res) => {
    res.sendFile(INDEX_FILE);
  });

  app.get("/login", async (req, res) => {
    const user = await TokenHandler.GetUserFrom(req.cookies.token);
    if (!user) {
      res.sendFile(INDEX_FILE);
    } else {
      res.redirect("/search");
    }
  });
  app.get("/api/uploads*", RequireAuthentication, upload);

  app.use("/api/upload", upload);
  app.use("/api/users", users);
  app.use("/api/notion", notion);
  app.use("/api/rules", rules);
  app.use("/api/settings", _settings);
  app.use("/api/download", download);
  app.use("/api/favorite", favorite);

  // Note: this has to be the last handler
  app.get("*", (_req, res) => {
    res.sendFile(INDEX_FILE);
  });

  app.use(
    (
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.header("Access-Control-Allow-Origin", ALLOWED_ORIGINS.join(","));
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Content-Disposition"
      );
      next();
    }
  );

  if (process.env.NODE_ENV === "production") {
    CrashReporter.AddErrorHandler(app);
  }

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => ErrorHandler(res, err)
  );

  process.on("uncaughtException", (err: Error) => {
    console.error(err);
  });

  DB.raw("SELECT 1").then(() => {
    console.info("DB is ready");
  });
  const cwd = process.cwd();
  if (process.env.MIGRATIONS_DIR) {
    process.chdir(path.join(process.env.MIGRATIONS_DIR, ".."));
  }
  ScheduleCleanup(DB);
  /* @ts-ignore */
  DB.migrate.latest(KnexConfig).then(() => {
    process.chdir(cwd);
    process.env.SECRET ||= "victory";
    const port = process.env.PORT || 2020;
    const server = app.listen(port, () => {
      console.info(`🟢 Running on http://localhost:${port}`);
    });

    const HandleStartedJobs = async () => {
      await ConversionJob.MarkStartedJobsStale(DB);
    };

    process.on("SIGTERM", () => {
      console.debug("SIGTERM signal received: closing HTTP server");
      server.close(async () => {
        console.debug("HTTP server closed");
        await HandleStartedJobs();
      });
    });
    process.on("SIGINT", async () => {
      server.close(async () => {
        console.debug("HTTP server closed");
        await HandleStartedJobs();
      });
    });
  });
}

serve();
