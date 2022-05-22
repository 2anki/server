import { ALLOWED_ORIGINS, BUILD_DIR, INDEX_FILE } from "./lib/constants";
import cookieParser from "cookie-parser";
import CrashReporter from "./lib/CrashReporter";
import ErrorHandler from "./lib/misc/ErrorHandler";
import morgan from "morgan";
import RequireAuthentication from "./middleware/RequireAuthentication";
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

const getApi = function({ templateDir }: {
  templateDir: string;
}): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(BUILD_DIR));

  if (process.env.NODE_ENV === "production") {
    CrashReporter.Configure(app);
  }

  if (process.env.SPACES_DEFAULT_BUCKET_NAME !== "dev.2anki.net") {
    app.use(morgan("combined"));
  }

  // Routes/handlers
  app.get("/search*", RequireAuthentication, search);
  app.get("/login", login);
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
    res.sendFile(INDEX_FILE);
  });

  app.use(handleCors);

  if (process.env.NODE_ENV === "production") {
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

