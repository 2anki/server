import { ALLOWED_ORIGINS } from "./lib/constants";
import cookieParser from "cookie-parser";
import CrashReporter from "./lib/CrashReporter";
import ErrorHandler from "./lib/misc/ErrorHandler";
import morgan from "morgan";
import path from "path";
import RequireAuthentication from "./middleware/RequireAuthentication";
import { processenv } from "processenv";
import express, { Express } from "express";

// Server Endpoints
import checks from "./routes/checks";
import download from "./routes/download/u";
import favorite from "./routes/favorite";
import login from "./routes/login";
import notion from "./routes/notion";
import rules from "./routes/rules";
import search from "./routes/search";
import settings from "./routes/settings";
import upload from "./routes/upload";
import users from "./routes/users";
import version from "./routes/version";

const getApi = function({ distDir, templateDir }: {
  distDir: string;
  templateDir: string;
}): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(distDir));

  if (processenv('NODE_ENV') as string === "production") {
    CrashReporter.Configure(app);
  }

  if (processenv("SPACES_DEFAULT_BUCKET_NAME") as string !== "dev.2anki.net") {
    app.use(morgan("combined"));
  }

  // Routes/handlers
  app.get("/search*", RequireAuthentication, search({ distDir }));
  app.get("/login", login({ distDir }));
  app.get("/api/uploads*", RequireAuthentication, upload);

  app.use("/templates", express.static(templateDir));
  app.use("/checks", checks);
  app.use("/version", version);

  app.use("/api/upload", upload);
  app.use("/api/users", users);
  app.use("/api/notion", notion);
  app.use("/api/rules", rules);
  app.use("/api/settings", settings);
  app.use("/api/download", download);
  app.use("/api/favorite", favorite);

  // Note: this has to be the last handler
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });

  app.use(handleCors);

  if (processenv('NODE_ENV') as string === "production") {
    CrashReporter.AddErrorHandler(app);
  }

  app.use(handleError);

  return app;
};

const handleCors = function () {
  return (
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
}

const handleError = function () {
  return (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => ErrorHandler(res, err)
}

export { getApi };

