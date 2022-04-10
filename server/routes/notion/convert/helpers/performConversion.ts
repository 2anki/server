import fs from "fs";

import express from "express";
import CardGenerator from "../../../../lib/anki/CardGenerator";
import ConversionJob from "../../../../lib/jobs/ConversionJob";
import BlockHandler from "../../../../lib/notion/BlockHandler";

import NotionAPIWrapper from "../../../../lib/notion/NotionAPIWrapper";
import CustomExporter from "../../../../lib/parser/CustomExporter";
import ParserRules from "../../../../lib/parser/ParserRules";
import Settings from "../../../../lib/parser/Settings";
import Workspace from "../../../../lib/parser/WorkSpace";
import DB from "../../../../lib/storage/db";
import getQuota from "../../../../lib/User/getQuota";
import isPatron from "../../../../lib/User/isPatron";
import StorageHandler from "../../../../lib/storage/StorageHandler";
import { FileSizeInMegaBytes } from "../../../../lib/misc/file";
import getEmailFromOwner from "../../../../lib/User/getEmailFromOwner";
import EmailHandler from "../../../../lib/email/EmailHandler";

export default async function performConversion(
  api: NotionAPIWrapper,
  id: string,
  owner: string,
  req: express.Request | null,
  res: express.Response | null
) {
  const storage = new StorageHandler();
  try {
    console.log(`Performing conversion for ${id}`);
    const job = new ConversionJob(DB);
    const allJobs = await job.AllStartedJobs(owner);
    console.log("user has jobs", allJobs.length);

    if (allJobs.length === 1 && !res?.locals.patreon) {
      console.log("skipping conversion");
      return res?.status(429).send({
        message:
          "Request denied, only <a href='https://www.patreon.com/alemayhu'>patrons</a> are allowed to make multiple conversions at a time. You already have a conversion in progress. Wait for your current conversion to finish or cancel it under <a href='/uploads'>Uploads</a>.",
      });
    }

    const isActiveJob = await job.isActiveJob(id, owner);
    if (isActiveJob) {
      console.log(`job ${id} is already active`);
      return res ? res.status(200).send() : null;
    }

    const quota = await getQuota(DB, owner);
    if (quota > 21 && !res?.locals.patreon) {
      return res
        ?.status(429)
        .json({ message: "You have reached your quota max of 21MB" });
    }
    console.log("user quota", quota);

    console.log(`job ${id} is not active, starting`);
    await job.started(id, owner);

    if (res) res.status(200).send();

    const ws = new Workspace(true, "fs");
    console.debug(`using workspace ${ws.location}`);
    const exporter = new CustomExporter("", ws.location);
    const settings = await Settings.LoadFrom(DB, owner, id);
    const bl = new BlockHandler(exporter, api);
    const rules = await ParserRules.Load(owner, id);

    if (res) bl.useAll = rules.UNLIMITED = res?.locals.patreon;
    else {
      const user = await isPatron(DB, owner);
      console.log("checking if user is patreon", user);
      bl.useAll = rules.UNLIMITED = user.patreon;
    }

    if (req && req.query && req.query.type) {
      rules.setDeckIs(req.query.type.toString(), id, owner);
    }

    const decks = await bl.findFlashcards(
      id.replace(/\-/g, ""),
      rules,
      settings,
      [],
      settings.deckName
    );
    exporter.configure(decks);
    const gen = new CardGenerator(ws.location);
    const payload = (await gen.run()) as string;
    const apkg = fs.readFileSync(payload);
    const filename = (() => {
      const f = settings.deckName || bl.firstPageTitle || id;
      if (f.endsWith(".apkg")) {
        return f;
      }
      return f + ".apkg";
    })();

    const key = storage.uniqify(id, owner, 200, "apkg");
    await storage.uploadFile(key, apkg);
    const size = FileSizeInMegaBytes(payload);
    await DB("uploads").insert({
      object_id: id,
      owner,
      filename,
      /* @ts-ignore */
      key,
      size_mb: size,
    });

    console.log("rules.email", rules.EMAIL_NOTIFICATION);
    await job.completed(id, owner);
    const email = await getEmailFromOwner(DB, owner);
    if (size > 24) {
      const prefix = req
        ? `${req.protocol}://${req.get("host")}`
        : "https://2anki.net";
      const link = `${prefix}/download/u/${key}`;
      await EmailHandler.SendConversionLinkEmail(email, id, link);
    } else if (rules.EMAIL_NOTIFICATION) {
      await EmailHandler.SendConversionEmail(email, id, apkg);
    }
  } catch (error) {
    console.error(error);
  }
}
