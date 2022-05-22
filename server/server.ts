import ConversionJob from "./lib/jobs/ConversionJob";
import DB from "./lib/storage/db";
import dotenv from "dotenv";
import fs from "fs";
import { getApi } from "./getApi";
import { IsDebug } from "./lib/debug";
import KnexConfig from "./KnexConfig";
import path from "path";
import { ScheduleCleanup } from "./lib/jobs/JobHandler";

(async function (): Promise<void> {
  try {
    if (IsDebug()) {
      const localEnvFilePath = path.join(__dirname, ".env");
      try {
        await fs.promises.access(localEnvFilePath);
        dotenv.config({ path: localEnvFilePath });
      } catch (ex: unknown) {
        console.warn(`Could not load local .env file in path ${localEnvFilePath}`);
      }
    }

    if (!!process.env.WORKSPACE_BASE) {
      process.env.WORKSPACE_BASE = "/tmp/workspace";
      await fs.promises.mkdir(process.env.WORKSPACE_BASE, { recursive: true });
    }

    const templateDir = path.join(__dirname, "templates");

    const api = getApi({ templateDir })

    await DB.raw("SELECT 1")
    console.info("DB is ready");

    const migrationsDirectory = process.env.MIGRATIONS_DIR as string;
    if (migrationsDirectory) {
      process.chdir(path.join(migrationsDirectory, ".."));
    }
    ScheduleCleanup(DB);
    /* @ts-ignore */
    await DB.migrate.latest(KnexConfig);

    const currentWorkingDirectory = process.cwd();
    process.chdir(currentWorkingDirectory);

    process.env.SECRET ||= "victory";

    const port = process.env.PORT || 2020;

    const server = api.listen(port, (): void => {
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

  } catch (ex: unknown) {
    console.log("An unexpected error occurred.", ex);
    process.exit(1);
  }
})();

