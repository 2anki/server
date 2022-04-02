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

import { ALLOWED_ORIGINS } from "./lib/constants";
import ErrorHandler from "./lib/misc/error";

// Server Endpoints
import * as _settings from "./routes/settings";
import * as checks from "./routes/checks";
import * as version from "./routes/version";
import * as upload from "./routes/upload";
import * as users from "./routes/users";
import * as notion from "./routes/notion";
import * as rules from "./routes/rules";
import * as download from "./routes/download";
import * as patreon from "./routes/patreon";

import DB from "./lib/storage/db";
import config from "./knexfile";
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
  const distDir = path.join(__dirname, "../web/build");
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
  app.use(express.static(distDir));
  app.use("/checks", checks.default);
  app.use("/version", version.default);

  // TODO: move to own file
  app.get("/search*", RequireAuthentication, async (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });

  // TODO: move into users?
  app.get("/login", async (req, res) => {
    const user = await TokenHandler.GetUserFrom(req.cookies.token);
    if (!user) {
      res.sendFile(path.join(distDir, "index.html"));
    } else {
      res.redirect("/search");
    }
  });
  app.get("/uploads*", RequireAuthentication, upload.default);

  app.use("/patreon", patreon.default);
  app.use("/upload", upload.default);
  app.use("/users", users.default);
  app.use("/notion", notion.default);
  app.use("/rules", rules.default);
  app.use("/settings", _settings.default);
  app.use("/download", download.default);

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

  process.on("uncaughtException", (err: Error, origin: string) => {
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
  DB.migrate.latest(config).then(() => {
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
