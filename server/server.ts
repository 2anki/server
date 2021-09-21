import path from "path";
import os from "os";

import findRemoveSync from "find-remove";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

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
import { fstat, mkdirSync } from "fs";

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

  Sentry.init({
    dsn: "https://067ae1c6d7c847278d84a7bbd12515ec@o404766.ingest.sentry.io/5965064",
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  app.use(morgan("combined"));
  app.use("/templates", express.static(templateDir));
  app.use(express.static(distDir));
  app.use("/checks", checks.default);
  app.use("/version", version.default);
  app.use("/auth", connectNotion.default);

  // This is due to legacy stuff and links shared around the web
  const old = [
    "/notion",
    "/index",
    "/upload",
    "/tm",
    "/connect-notion",
    "/pre-signup",
    "/login", // TODO: handle token is set then redirect to dashboard
  ];
  for (const p of old) {
    console.log("setting up request handler for ", p);
    app.get(p, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });

    app.get(`${p}.html`, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.get("/dashboard", (req, res) => {
    const token = req.cookies.token;
    console.log("token", token);
    if (token) {
      // TODO: check if it's valid and if so, serve the dashboard
      console.log("req.token", req.cookies.token);
      res.sendFile(path.join(distDir, "index.html"));
    } else {
      res.redirect("/login#login");
    }
  });

  app.use("/upload", upload.default);
  app.use("/users", users.default);

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

  app.use(Sentry.Handlers.errorHandler());

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

  // TODO: remove the auto-removal of old files. Users should decide when they want to delete.
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
  /* @ts-ignore */
  DB.migrate.latest(config).then(() => {
    process.env.SECRET ||= "victory";
    const port = process.env.PORT || 2020;
    app.listen(port, () => {
      console.log(`🟢 Running on http://localhost:${port}`);
    });
  });
}

serve();
